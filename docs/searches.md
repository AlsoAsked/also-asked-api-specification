---
title: Synchronous and asynchronous searches
description: Learn how synchronous and asynchronous searches work, and how to choose the right mode for your integration.
type: concept
---

# Synchronous and asynchronous searches

When you perform a search with `POST https://alsoaskedapi.com/v1.1/search`, you choose whether the API waits for the
results. A synchronous search waits until the search is complete, and an asynchronous search returns a response
immediately. This page explains how each mode works, so you can pick the one that fits your integration.

## How to set the mode

The `async` field in the request body sets the mode. The default value is `false`, so if you don't include the field,
you get a synchronous search. To perform an asynchronous search, set the `async` field to `true`. In both modes,
AlsoAsked charges the credits before the search starts.

The following request performs a synchronous search:

```bash
curl --request POST 'https://alsoaskedapi.com/v1.1/search' \
  --header 'Content-Type: application/json' \
  --header 'X-Api-Key: YOUR_LIVE_API_KEY' \
  --data '{
    "terms": ["how to brew coffee"],
    "language": "en",
    "region": "us",
    "depth": 2,
    "fresh": false,
    "async": false,
    "notify_webhooks": true
  }'
```

The following request performs an asynchronous search with 2 terms:

```bash
curl --request POST 'https://alsoaskedapi.com/v1.1/search' \
  --header 'Content-Type: application/json' \
  --header 'X-Api-Key: YOUR_LIVE_API_KEY' \
  --data '{
    "terms": ["how to brew coffee", "how to brew tea"],
    "language": "en",
    "region": "us",
    "depth": 2,
    "fresh": false,
    "async": true,
    "notify_webhooks": true
  }'
```

## What a synchronous search returns

In a synchronous search, the API waits until the search is complete. A search is complete when its status is
`success`, `no_results`, or `error`. If the search isn't complete after 90 seconds, the API
stops waiting and returns the response anyway.

The timeout isn't an error. The response has the status code `200 OK` and the search as it is at that moment, for
example with the status `running`. The `queries` field is `null` until the search is complete. The search keeps running
after the response, and AlsoAsked doesn't cancel it, even if your client closes the connection. To get the results,
send a request to `GET /v1.1/search/{searchId}` with the `id` field from the response, or wait for the webhook events.

Set the timeout of your HTTP client to more than 90 seconds, for example 120 seconds. If your client stops waiting
first, the search still runs and still uses credits, but your code doesn't get its ID. To find the search, see
[Find a search after a lost response](./search-history.md#find-a-search-after-a-lost-response).

## What an asynchronous search returns

In an asynchronous search, the API returns the response immediately, without waiting for the search to finish. Both
modes return the status code `200 OK` and the same search object that `GET /v1.1/search/{searchId}` returns. The
`queries` field is `null` until the search is complete.

The following JSON is an example response body of an asynchronous search that isn't complete yet:

```json
{
  "id": "3K9dPq2LmX7vB4nT8wY1zR6cH5jF0sGa",
  "language": "en",
  "region": "us",
  "latitude": null,
  "longitude": null,
  "status": "queueing",
  "deleted": false,
  "depth": 2,
  "cached": false,
  "created_at": "2023-01-05T10:30:00+00:00",
  "updated_at": "2023-01-05T10:30:00+00:00",
  "cached_at": null,
  "queries": null
}
```

To get the results later, send a request to the `GET /v1.1/search/{searchId}` endpoint with the `id` field from the
response. Check the `status` field until the search is complete, for example every 60 seconds. You can also wait for
webhook events instead.

## Stored results, statuses, and deadlines

Both modes follow the same rules for how a search runs:

- If every term in your search has stored results, the search is complete as soon as you perform it. The API returns
  the results immediately in both modes, and the `async` field makes no difference.
- The status of a search comes from the statuses of its terms, and a search is complete only when every term is
  complete.
- A search typically completes in 15 to 30 seconds. In the worst case, every term is complete, or fails with the status
  `error`, within about 15 minutes of when you perform the search.

For details, see [How a search runs](./how-a-search-runs.md).

## Webhook events

AlsoAsked sends webhook events when the status of a search changes. This happens in both modes, including synchronous
searches. The `notify_webhooks` field controls this, and its default value is `true`. If you don't want webhook events
for a search, set the `notify_webhooks` field to `false`. On the live API, AlsoAsked sends webhook events only if your
account has a Pro plan. For details, see [Webhooks](./webhooks.md).

## When to use a synchronous or an asynchronous search

| | Synchronous search | Asynchronous search |
| --- | --- | --- |
| `async` field | `false` (default) | `true` |
| When the API returns the response | When the search is complete, or after 90 seconds | Immediately |
| Status code | `200 OK` | `200 OK` |
| `queries` field in the response | The queries if the search is complete, otherwise `null` | The queries if the search is complete (for example, when every term has stored results), otherwise `null` |
| How to get results that aren't ready yet | `GET /v1.1/search/{searchId}`, or webhook events | `GET /v1.1/search/{searchId}`, or webhook events |

Use a synchronous search when you want the results in the same response and your search has 1 term. AlsoAsked starts
a search with 1 term before the waiting terms of searches with more than 1 term.

Use an asynchronous search when your search has many terms, or when your code shouldn't wait for the response. Then get
the results with the `GET /v1.1/search/{searchId}` endpoint or from your webhook events. For a large number of terms,
see [Search many terms](./bulk-searches.md).

## Related

- [How a search runs](./how-a-search-runs.md)
- [Perform a search](./perform-a-search.md)
- [Search results](./search-results.md)
- [Webhooks](./webhooks.md)
- [OpenAPI specification](../openapi/openapi.yaml)
