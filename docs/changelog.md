---
title: Changelog
description: Find the changes to the AlsoAsked API, with the date of each change.
type: reference
---

# Changelog

This page lists the changes to the AlsoAsked API. The newest changes are first.

## 2026-11-26

- AlsoAsked now sends the `search_succeeded` webhook event or the `search_failed` webhook event once, when every term of the search has finished. A search gets `search_failed` only when every term failed. Before this change, AlsoAsked sent the webhook event when the first term finished, and a search with mixed results could get both webhook events. See [Webhooks](./webhooks.md).
- On the sandbox API, the `[error]` and `[no_results]` test terms now set the result of their own term only, as on the live API. Before this change, a test term set the result of the whole search. See [Sandbox API](./sandbox.md).
- AlsoAsked now counts only a `2xx` status code from a webhook endpoint as delivered. A redirect (`3xx`) is a failed attempt, and AlsoAsked sends the webhook event again, up to 10 attempts in total. Before this change, AlsoAsked counted a redirect as delivered, so the webhook endpoint didn't get the webhook event. See [Webhooks](./webhooks.md).
- The `cached` field of a search is now `true` only when at least one term used results that AlsoAsked stored for an earlier search. The `cached_at` field is when AlsoAsked stored the oldest of those results. Before this change, `cached` was `true` for every completed search with results, including a search that got new results from Google. See [Search results](./search-results.md).
- The `message` field of a `429 Too Many Requests` response no longer refers to a limit per second. The `status` field is still `rate_limit_exceeded`. See [Rate limits](./rate-limits.md).

## 2026-11-24

- If a search sets only one of the `latitude` and `longitude` fields, the API now rejects the search with a `422 Unprocessable Content` validation error. Before this change, the API ignored the single coordinate and used the default location of the region.
- The API now uses a value of `0` in the `latitude` field or the `longitude` field as a real coordinate. Before this change, the API treated the coordinates `0, 0` as no location.

## 2026-11-09

- AlsoAsked raised the rate limit to 200 requests in a 5-minute window. The rate limit applies to each API key and to each IP address.

## 2026-07-13

- AlsoAsked released API v1.1. API v1.1 is available at `https://alsoaskedapi.com/v1.1` and `https://sandbox.alsoaskedapi.com/v1.1`. API v1.1 has these changes:
  - Fixed an issue where the API duplicated child results at the top level of the tree in the `results` field. The top level now contains only the top-level results, and each child result is inside its parent result. Searches that you perform through v1 still return the previous structure, including in the body of webhook events.
  - Added the `position` field to each search result. The `position` field contains the one-based path to the result in the results tree. For example, `[3, 1]` is the path to the first child result of the third top-level result.
  - Added the `results_format` query parameter to the `GET /search/{searchId}` endpoint. The `tree` value, which is the default, returns the results as a hierarchy. The `flat` value returns the results as a single list in depth-first order, without the nested `results` field.
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
