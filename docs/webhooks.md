---
title: Webhooks
description: Learn how AlsoAsked sends webhook events to your webhook endpoints when the status of a search changes, and how your server must respond.
type: concept
---

# Webhooks

A webhook event is a request that AlsoAsked sends to your webhook endpoint when the status of a search changes. With
webhook events, your integration doesn't need to send repeated requests to `GET /v1.1/search/{searchId}` to find out
when a search is complete. This page explains how to add a webhook endpoint, which webhook events AlsoAsked sends, and
how your server must respond to them.

## Add a webhook endpoint

A webhook endpoint is a URL on your server that receives webhook events from AlsoAsked. Each webhook endpoint has a URL,
an environment (`live` or `sandbox`), and a list of the webhook events that the webhook endpoint receives.

To add a webhook endpoint on the AlsoAsked website, do the following steps:

1. Sign in to AlsoAsked, and go to the **Webhooks** page at `https://alsoasked.com/developer/webhooks`.
2. If you don't have a webhook signing key, select **Generate signing key** in the **Webhook signing key** section, and
   store the key in a safe place. AlsoAsked shows the webhook signing key only once. The **Webhook endpoints** section
   appears after you have a webhook signing key.
3. In the **Webhook endpoints** section, select **Add webhook endpoint**.
4. In the **URL** field, enter the URL of the webhook endpoint.
5. In the **Environment** field, choose **Live** or **Sandbox**.
6. In the **Events** field, choose one or more of **Search created**, **Search started**, **Search succeeded**, and
   **Search failed**. The webhook endpoint receives only the webhook events that you choose.
7. Select **Add endpoint**.

Each account can have a maximum of 5 webhook endpoints.

## Rules for the webhook endpoint URL

The URL of a webhook endpoint must follow these rules:

- The URL starts with `http://` or `https://`.
- The URL has a maximum of 255 characters.
- The host isn't `localhost`, and the host isn't an IP address.
- The URL has no port.
- The host has an A record or a canonical name (CNAME) record that resolves to a public IP address.

AlsoAsked checks the IP address of the host again each time it sends a webhook event to the webhook endpoint.
AlsoAsked connects to the webhook endpoint over IPv4 only.

Because `localhost` and IP addresses aren't allowed, you can't use a URL on your own computer as a webhook endpoint. To
receive webhook events during local development, use a tunnel service, such as ngrok or localhost.run, and add the
public URL of the tunnel as the webhook endpoint.

## Webhook event types

AlsoAsked has 4 webhook event types:

| Webhook event type | When AlsoAsked sends the webhook event | Status of the search in the body |
| --- | --- | --- |
| `search_created` | AlsoAsked recorded the search. | Usually `queueing` or `pending`. `success` if every term had stored results. |
| `search_started` | The first term of the search started to run. | `running`, or a later status if AlsoAsked sent the event late. |
| `search_succeeded` | Every term of the search is complete, and at least one term has the status `success` or `no_results`. | `success` or `no_results` |
| `search_failed` | Every term of the search is complete, and every term has the status `error`. | `error` |

Each search gets `search_created`, then `search_started`, then one of `search_succeeded` and `search_failed`, with
these exceptions:

- If every term of the search has stored results, no term runs, so the search gets no `search_started` event.
  `search_created` and the completion event follow immediately.
- If the search fails before any term starts to run, the search gets no `search_started` event, only
  `search_created` and `search_failed`.
- A search whose every term has no results gets `search_succeeded`, not `search_failed`, with the status `no_results`.
- A search never gets both `search_succeeded` and `search_failed`.
- After you delete a search, AlsoAsked sends no more webhook events for it.

A webhook endpoint receives only the webhook event types that you chose for that webhook endpoint. If you add a webhook
endpoint while a search runs, the webhook endpoint gets only the webhook events that happen after you add it.

To see the result of each term, read the `queries` field in the body of the `search_succeeded` or `search_failed`
webhook event. Each query has its own `status` field.

## Order and repeats of webhook events

AlsoAsked sends each webhook event separately, and retries a failed webhook event later. So webhook events can arrive
in a different order from the order of the status changes. For example, a retried `search_created` webhook event can
arrive after the `search_succeeded` webhook event. Use the `status` field in the body to decide what to do, not the
order of arrival.

AlsoAsked builds the body when it sends the request, from the search as it is at that moment. A retried webhook event
has the current status of the search, not the status at the time of the change. For example, a retried
`search_created` webhook event can have the status `success` and the results.

In rare cases, AlsoAsked sends the same webhook event twice. Every delivery of the same webhook event has the same
`event_id` field in the body. If your webhook endpoint receives an `event_id` that it already processed, return a `2xx`
status code and ignore the body. Use the `event_id` field, not the headers: the signature covers the body, but not the
headers.

## When AlsoAsked sends webhook events

The `notify_webhooks` field in the `POST /v1.1/search` request body controls the webhook events for a search. The
default value of the `notify_webhooks` field is `true`. If you don't want webhook events for a search, set the
`notify_webhooks` field to `false`. AlsoAsked sends webhook events for both synchronous searches and asynchronous
searches. For details, see [Synchronous and asynchronous searches](./searches.md).

For a search on the live API, AlsoAsked sends webhook events only if your account has a Pro plan when it sends each
webhook event. For a search on the sandbox API, AlsoAsked sends webhook events to your webhook endpoints with the
`sandbox` environment. For details, see [Sandbox API](./sandbox.md).

If you're a member of a team, AlsoAsked sends the webhook events for your searches to your own webhook endpoints, and
signs them with your own webhook signing key, not the team owner's.

## Webhook request

For each webhook event, AlsoAsked sends a `POST` request with a JSON body to the URL of the webhook endpoint.

The webhook request has these headers:

| Header | Value |
| --- | --- |
| `Content-Type` | `application/json` |
| `X-AlsoAsked-Webhook-Event` | The webhook event type, for example `search_succeeded`. |
| `X-AlsoAsked-Environment` | The environment of the webhook event: `live` or `sandbox`. |
| `X-AlsoAsked-Timestamp` | The time when AlsoAsked sent the request, as a Unix time in seconds. |
| `X-AlsoAsked-Signature` | The signature of the request. For details, see [Verify webhook signatures](./verify-webhook-signatures.md). |
| `X-AlsoAsked-Credits` | The credits that remain in your account, the same as the `X-AlsoAsked-Credits` header of an API response. For a sandbox webhook endpoint, the value is the sandbox credits that remain. |
| `X-AlsoAsked-Api-Version` | The version of the webhook request format. The current version is `1.0`. This isn't the version of the AlsoAsked API, such as `v1.1`. |
| `User-Agent` | `AlsoAsked/1.0` |

The body of the webhook request starts with the `event_id` field, which holds the ID of the webhook event: 32 letters and digits.
The other fields are the search object, the same as the response body of `GET /v1.1/search/{searchId}` for the search
when AlsoAsked sends the request. The `queries` field is `null` until the search is complete. For the fields of the
search object, see [Search results](./search-results.md).

The body uses the format of the API version that performed the search. This page describes searches that you perform
with the `v1.1` API. Searches that you perform on the AlsoAsked website send bodies in the older `v1` format, without
the `event_id` field and without the `status` field of each query.

## Example webhook request

The following example shows the headers of a `search_succeeded` webhook event from the live API. The value of the
`X-AlsoAsked-Signature` header is shortened.

```http
POST /alsoasked-webhooks HTTP/1.1
Host: example.com
Content-Type: application/json
User-Agent: AlsoAsked/1.0
X-AlsoAsked-Webhook-Event: search_succeeded
X-AlsoAsked-Environment: live
X-AlsoAsked-Timestamp: 1672531210
X-AlsoAsked-Signature: 3f9c2a7e...b41d
X-AlsoAsked-Credits: 4950
X-AlsoAsked-Api-Version: 1.0
```

The following JSON shows the body of the same webhook event. The search has 1 term and a depth of 2. The example is
shortened: it has 1 result, 1 AI overview source, and no child results.

```json
{
  "event_id": "4Jk2mQ9xVb7NzR1cT8yHp3LdWs6FgE0a",
  "id": "9J1VrsN0ku2E6xW8M5Xh3zylpfZgIcba",
  "language": "en",
  "region": "us",
  "latitude": 51.5072,
  "longitude": 0.1276,
  "status": "success",
  "deleted": false,
  "depth": 2,
  "cached": true,
  "created_at": "2023-01-01T00:00:00+00:00",
  "updated_at": "2023-01-01T00:00:10+00:00",
  "cached_at": "2022-12-31T00:00:00+00:00",
  "queries": [
    {
      "term": "When to plant out broad beans?",
      "status": "success",
      "language_fallback": false,
      "region_fallback": false,
      "results": [
        {
          "question": "When to plant out broad beans?",
          "position": [1],
          "answer_excerpt": "Broad beans can be planted out from mid-April to mid-May. If you are growing them in a greenhouse, you can plant them out from mid-March.",
          "answer_href": "https://www.gardenersworld.com/how-to/grow/broad-beans/when-to-plant-out-broad-beans/",
          "answer_page_title": "When to plant out broad beans? | Broad beans | Grow | Gardeners' World Magazine",
          "ai_overview": true,
          "ai_overview_hrefs": [
            "https://www.gardenersworld.com/how-to/grow/broad-beans/when-to-plant-out-broad-beans/"
          ],
          "ai_overview_page_titles": [
            "When to plant out broad beans? | Broad beans | Grow | Gardeners' World Magazine"
          ],
          "results": []
        }
      ]
    }
  ]
}
```

## Respond to a webhook event

When your webhook endpoint receives a webhook event, return a `2xx` status code, for example `200 OK`, as quickly as
possible. AlsoAsked waits a maximum of 30 seconds for the response. If your server needs more time
to process the webhook event, return the status code first and process the body after.

AlsoAsked counts only a `2xx` status code as delivered. AlsoAsked doesn't follow redirects, so a redirect (`3xx`) is a
failed attempt. The details of the webhook event show the URL that your webhook endpoint redirected to. Use the final
URL as the webhook endpoint, for example the `https://` URL. AlsoAsked uses the current URL of the webhook endpoint at
each attempt, so if you correct the URL, the next attempt goes to the new URL.

## Retries of failed webhook events

AlsoAsked counts an attempt to send a webhook event as failed in these cases:

- The webhook endpoint returns a status code that isn't `2xx`, including a redirect (`3xx`).
- The webhook endpoint doesn't respond within the timeout. The timeout is 30 seconds.
- AlsoAsked can't connect to the webhook endpoint.

AlsoAsked tries to send each webhook event a maximum of 10 times. After a failed attempt,
AlsoAsked waits 1 minute for each attempt made so far, and then tries again:

| Failed attempt | Wait before the next attempt |
| --- | --- |
| 1 | 1 minute |
| 2 | 2 minutes |
| 3 | 3 minutes |
| 4 | 4 minutes |
| 5 | 5 minutes |
| 6 | 6 minutes |
| 7 | 7 minutes |
| 8 | 8 minutes |
| 9 | 9 minutes |
| 10 | No next attempt |

If all 10 attempts fail, AlsoAsked stops, and the webhook event has the status `failed`. The waits between the first
attempt and the last attempt add up to 45 minutes.

AlsoAsked doesn't try again in these cases, and the webhook event gets the status `failed` immediately:

- Your account has no webhook signing key. AlsoAsked can't sign the webhook request without it. The error of the
  webhook event says to generate a webhook signing key.
- The webhook endpoint is for the live API, and your account doesn't have a Pro plan.
- You deleted the webhook endpoint.

AlsoAsked has no way to send a failed webhook event again. To get the result of the search, send a request to
`GET /v1.1/search/{searchId}`.

## Security of webhook events

Each webhook request has a signature in the `X-AlsoAsked-Signature` header. The signature is a hash-based message
authentication code (HMAC) that uses SHA-384, made with your webhook signing key from the raw request body and the
value of the `X-AlsoAsked-Timestamp` header. Verify the signature before you
use the body. For the steps, see [Verify webhook signatures](./verify-webhook-signatures.md).

AlsoAsked sends webhook events from the IP address `18.168.235.198`.


## Inspect webhook events and stop retries

To see the webhook events that AlsoAsked sent, go to the **Webhooks** page at
`https://alsoasked.com/developer/webhooks`. The **Webhook events** section lists the webhook events. The webhook event
with the most recent attempt is first.

To see the details of a webhook event, select **View**. The details show the URL, the environment, the status, the
error, the number of attempts, the time of the last attempt and the next attempt, the request, and the response from
your webhook endpoint. AlsoAsked stores the first 2 MB of the response.

Each webhook event has one of these statuses:

| Status | Meaning |
| --- | --- |
| `pending` | AlsoAsked hasn't sent the webhook event yet, or waits to try again after a failed attempt. |
| `sending` | AlsoAsked is sending the webhook event now. |
| `succeeded` | Your webhook endpoint returned a `2xx` status code. |
| `failed` | Every attempt failed, or AlsoAsked doesn't try again. See [Retries of failed webhook events](#retries-of-failed-webhook-events). |
| `deleted` | You deleted the webhook event, so AlsoAsked doesn't try again. The webhook event stays in the list. |

To stop the retries of a webhook event, select **Delete** for the webhook event, or delete the webhook endpoint.

## Webhook events for website searches

By default, a search that you perform on the AlsoAsked website doesn't send webhook events. To get webhook events for
searches on the AlsoAsked website, do the following steps:

1. Sign in to AlsoAsked, and go to the **API settings** page at `https://alsoasked.com/developer/settings`.
2. Select **Website searches should notify webhooks**.
3. Select **Save changes**.

AlsoAsked sends the webhook events for website searches to your live webhook endpoints, and only if your account has a
Pro plan. The body of these webhook events uses the older `v1` format: it has no `event_id` field, no `status` field in
each query, and no `position` field in each result, and child results also appear at the top level of the `results`
field.

## Related

- [Verify webhook signatures](./verify-webhook-signatures.md)
- [Synchronous and asynchronous searches](./searches.md)
- [Search results](./search-results.md)
- [Perform a search](./perform-a-search.md)
- [Sandbox API](./sandbox.md)
- [OpenAPI specification](../openapi/openapi.yaml)
