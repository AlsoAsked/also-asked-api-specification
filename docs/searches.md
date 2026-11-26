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
you get a synchronous search. Set `async` to `true` to perform an asynchronous search. In both modes, AlsoAsked charges
the credits before the search starts.

The following request performs a synchronous search:

```bash
curl --request POST 'https://alsoaskedapi.com/v1.1/search' \
  --header 'Content-Type: application/json' \
  --header 'X-Api-Key: YOUR_API_KEY' \
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

The following request performs an asynchronous search:

```bash
curl --request POST 'https://alsoaskedapi.com/v1.1/search' \
  --header 'Content-Type: application/json' \
  --header 'X-Api-Key: YOUR_API_KEY' \
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

In a synchronous search, the API checks the search every second and waits until the search is complete. A search is
complete when its status is `success`, `no_results`, or `error`. If the search isn't complete after the timeout, the API
stops waiting and returns the response anyway. The default timeout is 90 seconds. <!-- PENDING C2: confirm the production timeout -->

The timeout isn't an error. The response still has the status code `200 OK`, but the `queries` field is `null`, not an
empty list. To get the results later, send a request to `GET /v1.1/search/{searchId}` with the `id` field from the response.

## What an asynchronous search returns

In an asynchronous search, the API returns the response immediately, without waiting for the search to finish. Both
modes return the status code `200 OK` and the same search object that `GET /v1.1/search/{searchId}` returns. The
`queries` field is `null` unless the status of the search is `success`.

To get the results later, send a request to `GET /v1.1/search/{searchId}` with the `id` field from the response. Check
the `status` field until the search is complete. You can also wait for webhook events instead.

## Searches with cached results

If every term in your search has cached results, the search is complete as soon as you perform it. In that case, the
API returns the results immediately in both modes, and the `async` field makes no difference.

## Status of a search with more than one term

Each term in a search has its own status, and the status of the search comes from the statuses of its terms. AlsoAsked
checks the statuses in this order: `running`, `fetching`, `pending`, `queuing`, `success`, `no_results`, `error`. The
first status that at least one term has becomes the status of the search.

For example, if one term has the status `success` and another term has the status `error`, the status of the search is
`success`. So a search with the status `success` doesn't always mean
that every term succeeded.

## Webhook events

AlsoAsked sends webhook events when the status of a search changes. This happens in both modes, including synchronous
searches. The `notify_webhooks` field controls this, and its default value is `true`. If you don't want webhook events
for a search, set `notify_webhooks` to `false`. On the live API, AlsoAsked sends webhook events only if your account has
a Pro plan. For details, see [Webhooks](./webhooks.md).

## When to use a synchronous or an asynchronous search

| | Synchronous search | Asynchronous search |
| --- | --- | --- |
| `async` field | `false` (default) | `true` |
| When the API returns the response | When the search is complete, or after the timeout (90 seconds by default) | Immediately |
| Status code | `200 OK` | `200 OK` |
| `queries` field in the response | The results if the status is `success`, otherwise `null` | The results if the status is `success`, otherwise `null` |
| How to get results that aren't ready yet | `GET /v1.1/search/{searchId}`, or webhook events | `GET /v1.1/search/{searchId}`, or webhook events |

Use a synchronous search when you want the results in the same response and your search has 1 term. A search with 1
term gets priority in the queue over a search with more than 1 term.

Use an asynchronous search when your search has many terms, or when your code shouldn't wait for the response. Then get
the results with `GET /v1.1/search/{searchId}` or from your webhook events.

## Related

- [Perform a search](./perform-a-search.md)
- [Search results](./search-results.md)
- [Webhooks](./webhooks.md)
- [OpenAPI specification](../openapi/openapi.yaml)
