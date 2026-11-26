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
complete when its status is `success`, `no_results`, or `error`. If the search isn't complete after 90 seconds, the API
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

To get the results later, send a request to `GET /v1.1/search/{searchId}` with the `id` field from the response. Check
the `status` field until the search is complete. You can also wait for webhook events instead.

## Searches with stored results

AlsoAsked stores the results of every search. If any account searched for the same term before, with the same language
code, region code, depth, and location, AlsoAsked can use the stored results instead of getting new results from
Google. A term that uses stored results costs no credits, however old the stored results are. The term must match
exactly, including uppercase and lowercase letters. AlsoAsked doesn't use stored results whose top-level answer is
blank.

To always get new results from Google, set the `fresh` field to `true`. Then every term costs credits.

If every term in your search has stored results, the search is complete as soon as you perform it. The API returns the
results immediately in both modes, and the `async` field makes no difference. The `cached` field of the search is
`true` if at least one term used stored results.

## Status of a search with more than one term

Each term in a search has its own status, and the status of the search comes from the statuses of its terms. AlsoAsked
checks the statuses in this order: `running`, `fetching`, `pending`, `queueing`, `success`, `no_results`, `error`. The
first status that at least one term has becomes the status of the search.

So the search is complete only when every term is complete. A search with the status `success` doesn't always mean that
every term succeeded: if one term has the status `success` and another term has the status `error`, the status of the
search is `success`. When the search is complete, each query in the `queries` field has its own `status` field:
`success`, `no_results`, or `error`. AlsoAsked refunds the credits of each term with the status `no_results` or `error`.

The status of a term doesn't change after it's `success`, `no_results`, or `error`.

## How long a search can take

A term that isn't complete by its deadline fails with the status `error`, and
AlsoAsked refunds its credits. The deadline starts when you perform the search, and depends on the number of terms in
the search:

| Search | Deadline of each term |
| --- | --- |
| 1 term | 15 minutes |
| More than 1 term | 60 minutes |

AlsoAsked checks for terms past their deadline every minute, so a term can fail up to about 2 minutes after its
deadline. Because every term finishes by its deadline, every search is complete within about an hour of when you
perform it.

## Webhook events

AlsoAsked sends webhook events when the status of a search changes. This happens in both modes, including synchronous
searches. The `notify_webhooks` field controls this, and its default value is `true`. If you don't want webhook events
for a search, set `notify_webhooks` to `false`. On the live API, AlsoAsked sends webhook events only if your account has
a Pro plan. For details, see [Webhooks](./webhooks.md).

## When to use a synchronous or an asynchronous search

| | Synchronous search | Asynchronous search |
| --- | --- | --- |
| `async` field | `false` (default) | `true` |
| When the API returns the response | When the search is complete, or after 90 seconds | Immediately |
| Status code | `200 OK` | `200 OK` |
| `queries` field in the response | The queries if the search is complete, otherwise `null` | The queries if the search is complete (for example, when every term has stored results), otherwise `null` |
| How to get results that aren't ready yet | `GET /v1.1/search/{searchId}`, or webhook events | `GET /v1.1/search/{searchId}`, or webhook events |

Use a synchronous search when you want the results in the same response and your search has 1 term. A search with 1
term gets priority in the queue over a search with more than 1 term.

Use an asynchronous search when your search has many terms, or when your code shouldn't wait for the response. Then get
the results with `GET /v1.1/search/{searchId}` or from your webhook events. For a large number of terms, see
[Search many terms](./bulk-searches.md).

## Related

- [Perform a search](./perform-a-search.md)
- [Search results](./search-results.md)
- [Webhooks](./webhooks.md)
- [OpenAPI specification](../openapi/openapi.yaml)
