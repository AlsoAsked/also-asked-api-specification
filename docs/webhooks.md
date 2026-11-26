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

| Webhook event type | When AlsoAsked sends the webhook event |
| --- | --- |
| `search_created` | AlsoAsked created the search. |
| `search_started` | The search started. |
| `search_succeeded` | Every term of the search finished, and at least one term has results or no results. |
| `search_failed` | Every term of the search finished, and every term failed. |

AlsoAsked sends the `search_succeeded` webhook event or the `search_failed` webhook event once, when every term of the
search has finished. A search never gets both. If at least one term succeeds, the search gets `search_succeeded`, even
if other terms failed. To see the result of each term, read the `queries` field in the body.

Normally, AlsoAsked sends each webhook event type 1 time for each search. A webhook endpoint receives only the
webhook event types that you chose for that webhook endpoint.

In rare cases, AlsoAsked can send the same webhook event twice. Make your webhook endpoint handle a repeated webhook
event safely, for example by checking the `id` field of the search and the `X-AlsoAsked-Webhook-Event` header before
you process the webhook event.

## When AlsoAsked sends webhook events

The `notify_webhooks` field in the `POST /v1.1/search` request body controls the webhook events for a search. The
default value of the `notify_webhooks` field is `true`. If you don't want webhook events for a search, set the
`notify_webhooks` field to `false`. AlsoAsked sends webhook events for both synchronous searches and asynchronous
searches. For details, see [Synchronous and asynchronous searches](./searches.md).

For a search on the live API, AlsoAsked sends webhook events only if your account has a Pro plan. For a search on the
sandbox API, AlsoAsked sends webhook events to your webhook endpoints with the `sandbox` environment. For details, see
[Sandbox API](./sandbox.md).

## Webhook request

For each webhook event, AlsoAsked sends a `POST` request with a JSON body to the URL of the webhook endpoint.

The webhook request has these headers:

| Header | Value |
| --- | --- |
| `X-AlsoAsked-Webhook-Event` | The webhook event type, for example `search_succeeded`. |
| `X-AlsoAsked-Environment` | The environment of the webhook event: `live` or `sandbox`. |
| `X-AlsoAsked-Timestamp` | The time when AlsoAsked sent the request, as a Unix time in seconds. |
| `X-AlsoAsked-Signature` | The signature of the request. For details, see [Verify webhook signatures](./verify-webhook-signatures.md). |
| `X-AlsoAsked-Credits` | The credits that remain in your account. For a sandbox webhook endpoint, the value is the sandbox credits that remain. |
| `X-AlsoAsked-Api-Version` | The API version, for example `1.0`. |
| `User-Agent` | `AlsoAsked/1.0` |

The body of the webhook request is the search object for the search. The body is the same as the response body of
`GET /v1.1/search/{searchId}` for the search, at the time when AlsoAsked sends the request. The `queries` field is
`null` unless the status of the search is `success`. For the fields of the search object, see
[Search results](./search-results.md).

## Example webhook request

The following example shows the headers of a `search_succeeded` webhook event from the live API. The value of the
`X-AlsoAsked-Signature` header is shortened.

```http
POST /alsoasked-webhooks HTTP/1.1
Host: example.com
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
  "id": "9J1VrsN0ku2E6xW8M5Xh3zylpfZgIcba",
  "language": "en",
  "region": "us",
  "latitude": 51.5072,
  "longitude": 0.1276,
  "status": "success",
  "deleted": false,
  "depth": 2,
  "cached": true,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:10Z",
  "cached_at": "2022-12-31T00:00:00Z",
  "queries": [
    {
      "term": "When to plant out broad beans?",
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

AlsoAsked doesn't follow redirects. AlsoAsked counts any response with a status code below `400`
as delivered, including a redirect (`3xx`). If your webhook endpoint returns a redirect, AlsoAsked doesn't send the
webhook event again, and your server doesn't get the webhook event. Use the final URL as the webhook endpoint, for
example the `https://` URL.

## Retries of failed webhook events

AlsoAsked counts an attempt to send a webhook event as failed in these cases:

- The webhook endpoint returns a status code of `400` or more.
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

- Your account has no webhook signing key. AlsoAsked can't sign the webhook request without it.
- The webhook endpoint is for the live API, and your account doesn't have a Pro plan.
- You deleted the webhook endpoint.

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
your webhook endpoint.

To stop the retries of a webhook event, select **Delete** for the webhook event, or delete the webhook endpoint.

## Webhook events for website searches

By default, a search that you perform on the AlsoAsked website doesn't send webhook events. To get webhook events for
searches on the AlsoAsked website, do the following steps:

1. Sign in to AlsoAsked, and go to the **API settings** page at `https://alsoasked.com/developer/settings`.
2. Select **Website searches should notify webhooks**.
3. Select **Save changes**.

## Related

- [Verify webhook signatures](./verify-webhook-signatures.md)
- [Synchronous and asynchronous searches](./searches.md)
- [Search results](./search-results.md)
- [Perform a search](./perform-a-search.md)
- [Sandbox API](./sandbox.md)
- [OpenAPI specification](../openapi/openapi.yaml)
