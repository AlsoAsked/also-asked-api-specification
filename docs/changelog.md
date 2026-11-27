---
title: Changelog
description: Find the changes to the AlsoAsked API, with the date of each change.
type: reference
---

# Changelog

This page lists the changes to the AlsoAsked API. The newest changes are first.

## 2026-11-27

- If an error happens while AlsoAsked records, queues, or waits for a search on the live API, the `POST /v1.1/search` endpoint now returns a `500 Internal Server Error` response with the error type `internal_server`. AlsoAsked refunds the credits of every term that isn't complete, as before. Before this change, the response had no `status` field. See [Internal server errors](./errors.md#internal-server-errors).
- The `updated_at` field of a search now shows the last change to any term of the search. For a deleted search, it shows when you deleted the search. Before this change, the `updated_at` field followed only the first term of the search. See [Search results](./search-results.md).

## 2026-11-26

### Webhooks

- AlsoAsked now sends the `search_succeeded` webhook event or the `search_failed` webhook event once, when every term of the search has finished. A search gets `search_failed` only when every term failed. Before this change, AlsoAsked sent the webhook event when the first term finished, and a search with mixed results could get both webhook events. See [Webhooks](./webhooks.md).
- AlsoAsked now counts only a `2xx` status code from a webhook endpoint as delivered. A redirect (`3xx`) is a failed attempt, and AlsoAsked sends the webhook event again, up to 10 attempts in total. The error of the webhook event shows the URL that the webhook endpoint redirected to. Before this change, AlsoAsked counted a redirect as delivered, so the webhook endpoint didn't get the webhook event. See [Webhooks](./webhooks.md).
- The body of a webhook event now starts with the `event_id` field. Every delivery of the same webhook event has the same ID, and the signature covers it, so you can use it to ignore a webhook event that you already processed. This change applies to searches that you perform with API v1.1 only. See [Webhooks](./webhooks.md).
- AlsoAsked now sends every webhook event for a team member's search to the webhook endpoints of the member who performed the search. Before this change, AlsoAsked sent the `search_started`, `search_succeeded`, and `search_failed` webhook events to the team owner's webhook endpoints.
- The `X-AlsoAsked-Credits` header of a webhook event from the live API now includes pay-as-you-go credits, the same as the `X-AlsoAsked-Credits` header of an API response. Before this change, it showed only the credits of your plan.
- AlsoAsked no longer tries again to send a webhook event that failed because your account has no webhook signing key. The error of the webhook event says to generate a webhook signing key.

### Searches and results

- The `cached` field of a search is now `true` only when at least one term used results that AlsoAsked stored for an earlier search. The `cached_at` field is when AlsoAsked stored the oldest of those results. Before this change, `cached` was `true` for every completed search with results, including a search that got new results from Google. See [Search results](./search-results.md).
- Each query in the `queries` field now has a `status` field with the result of its own term: `success`, `no_results`, or `error`. The `queries` field is now listed when a search ends with the status `no_results` or `error`, as well as `success`. Before this change, the `queries` field was `null` unless the whole search succeeded, so you couldn't see which terms failed. The `queries` field is still `null` while the search runs. This change applies to API v1.1 only. See [Search results](./search-results.md).
- AlsoAsked now uses the results that any account stored for an earlier search, however old they are, and a term that uses them costs no credits. Before this change, AlsoAsked used only your own account's results from the last 30 days. AlsoAsked doesn't use stored results if a top-level result has a blank answer excerpt. To get new results, set the `fresh` field to `true`. See [How a search runs](./how-a-search-runs.md#searches-with-stored-results).
- A search that you delete while it runs now finishes like any other search. AlsoAsked doesn't refund a term that succeeds after you delete the search, and refunds the terms that fail, have no results, or pass their deadline. Before this change, deleting a running search kept its credits. AlsoAsked creates no new webhook events for a search after you delete it. A webhook event that AlsoAsked created before you deleted the search can still arrive. See [Delete a search](./search-history.md#delete-a-search).

### Sandbox API

- On the sandbox API, the `[error]` and `[no_results]` test terms now set the result of their own term only, as on the live API. Before this change, a test term set the result of the whole search. See [Sandbox API](./sandbox.md).
- Webhook events from the sandbox API now use the format of the API version that performed the search, as webhook events from the live API do. Before this change, they always used the `v1` format.
- The sandbox API has 3 new test terms: `[server_error]` returns a `500 Internal Server Error` response, `[rate_limit]` returns a `429 Too Many Requests` response with a `Retry-After` header, and with `[timeout]`, the search runs past the 90 seconds that a synchronous search waits. A search with `[server_error]` or `[rate_limit]` costs no sandbox credits. See [Sandbox API](./sandbox.md#test-terms).
- If AlsoAsked can't record a search on the sandbox API, it now refunds the sandbox credits.

### Errors and rate limits

- The `message` field of a `429 Too Many Requests` response no longer refers to a limit per second. The `status` field is still `rate_limit_exceeded`. See [Rate limits](./rate-limits.md).
- A `422 Unprocessable Content` validation error now has an `errors` field. Each item names the field, parameter, or header that isn't valid, for example `terms.3`, in its `field` field, and describes the problem in its `message` field. This change applies to API v1.1 only. See [Errors](./errors.md#validation-errors).
- A request body that's valid JSON but isn't a JSON object, for example a list, now gets a `422 Unprocessable Content` validation error. Before this change, it got a `500 Internal Server Error` response.

## 2026-11-25

- AlsoAsked now applies the rate limit to an IPv6 client by its /64 network, not by its full address. See [Rate limits](./rate-limits.md).

## 2026-11-24

- If a search sets only one of the `latitude` and `longitude` fields, the API now rejects the search with a `422 Unprocessable Content` validation error. Before this change, the API ignored the single coordinate and used the default location of the region.
- The API now uses a value of `0` in the `latitude` field or the `longitude` field as a real coordinate. Before this change, the API treated the coordinates `0, 0` as no location.
- AlsoAsked now removes whitespace and invisible characters at the start and at the end of each term before it checks and charges the search. Terms that are the same after that count as one term, and AlsoAsked searches and charges them once. Before this change, AlsoAsked charged such terms twice. See [Terms](./perform-a-search.md#terms).
- The API now rejects a term that contains only whitespace, double quotes (`"`), or invisible characters with a `422 Unprocessable Content` validation error, and charges no credits. Before this change, AlsoAsked could charge credits for such a term before the search failed.
- If AlsoAsked can't search for a term, for example because of the text of the term, the term now fails immediately with the status `error`, and AlsoAsked refunds its credits. Before this change, the term stayed incomplete until its deadline. See [Status of a search with more than one term](./how-a-search-runs.md#status-of-a-search-with-more-than-one-term).
- If AlsoAsked can't record a search on the live API, it now refunds the credits of the search. Before this change, AlsoAsked kept the credits.
- AlsoAsked no longer uses stored results that have no results. Before this change, a term could use such stored results and get the status `success` with no results.

## 2026-11-12

- The `[delay N]` test term of the sandbox API now has a maximum of 3 seconds for each status change. Before this change, it had no maximum.
- An asynchronous search on the sandbox API now finishes within about 9 seconds. Before this change, AlsoAsked waited the delay in seconds instead of milliseconds, so an asynchronous search on the sandbox API could take more than an hour.

## 2026-11-09

- AlsoAsked raised the rate limit to 200 requests in a 5-minute window. The rate limit applies to each API key and to each IP address.
- AlsoAsked again fails a term that isn't complete by its deadline, with the status `error`, and refunds its credits. From May 2026 until this change, such a term stayed incomplete, and its search never completed. See [How long a search can take](./how-a-search-runs.md#how-long-a-search-can-take).

## 2026-07-13

- AlsoAsked released API v1.1. API v1.1 is available at `https://alsoaskedapi.com/v1.1` and `https://sandbox.alsoaskedapi.com/v1.1`. API v1.1 has these changes:
  - Fixed an issue where the API duplicated child results at the top level of the tree in the `results` field. The top level now contains only the top-level results, and each child result is inside its parent result. Searches that you perform through v1 still return the previous structure, including in the body of webhook events.
  - Added the `position` field to each search result. The `position` field contains the one-based path to the result in the results tree. For example, `[3, 1]` is the path to the first child result of the third top-level result.
  - Added the `results_format` query parameter to the `GET /v1.1/search/{searchId}` endpoint. The `tree` value, which is the default, returns the results as a hierarchy. The `flat` value returns the results as a single list in depth-first order, without the nested `results` field.
  - If a search doesn't set the `depth` field, the search now uses a depth of `2`, which matches the documented default. Searches that you perform through v1 still use a default depth of `3`.
- Added support for a search with a `depth` field value of `1`. A search with a depth of `1` returns only the top-level results and costs 1 credit for each term. This change applies to both v1 and v1.1.

## 2025-05-20

- Added the `ai_overview`, `ai_overview_hrefs`, and `ai_overview_page_titles` fields to search results. The `ai_overview` field shows whether the answer is an AI overview, which Google generates from more than one source. The `ai_overview_hrefs` and `ai_overview_page_titles` fields list the sources.

## 2025-04-10

- Added the `latitude` and `longitude` fields to searches.

## Related

- [Search results](./search-results.md)
- [Perform a search](./perform-a-search.md)
- [Rate limits](./rate-limits.md)
- [Webhooks](./webhooks.md)
