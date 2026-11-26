---
stoplight-id: u8gsgcbodk4lx
---

# Changelog

## 2026-11-26

* The `search_succeeded` and `search_failed` webhook events are now sent once, when every term of a search has finished, and `search_failed` is only sent when every term failed. Previously the event was sent when the first term finished, so a search with mixed results could send both
* Only a `2xx` response from a webhook endpoint now counts as delivered. A redirect (`3xx`) is now a failed attempt and is retried, and the webhook event's error shows where the endpoint redirected to. Previously a redirect counted as delivered, so the webhook endpoint never received the event
* The `cached` property of a search is now `true` only when at least one term used results stored for an earlier search, and `cached_at` is when the oldest of those results was stored. Previously `cached` was `true` for every completed search with results, including searches that got fresh results
* In the sandbox, the `[error]` and `[no_results]` terms now set the outcome of their own term only, as in the live environment. Previously one of these terms set the outcome of the whole search
* The message of a `429 Too Many Requests` response no longer refers to a limit per second. The `status` is still `rate_limit_exceeded`
* In v1.1, each query in `queries` now has a `status` property with the status of its own term, and `queries` is returned while a search is running and when a search ends with `no_results` or `error`. Previously `queries` was `null` until the whole search succeeded, so you couldn't tell which terms had failed
* In v1.1, `422` validation errors now include an `errors` array. Each item has a `field` property, which names the field, parameter or header (for example `terms.3`), and a `message` property. v1 responses are unchanged
* Webhook bodies for searches performed through v1.1 now start with an `event_id` property. Every delivery of the same webhook event has the same ID, and the ID is covered by the signature, so you can use it to ignore an event that you've already processed
* Results that AlsoAsked stored for an earlier search are now reused by every account, however old they are, and a term that uses them costs no credits. Previously only your own account's results from the last 30 days were reused. Set `fresh` to `true` to get new results
* Every webhook event for a team member's search now goes to the webhook endpoints of the member who performed the search. Previously the `search_started`, `search_succeeded` and `search_failed` events went to the team owner's webhook endpoints
* Sandbox webhook bodies now use the API version that the search was performed through, as live webhook bodies do. Previously sandbox webhook bodies always used the v1 format
* The `X-AlsoAsked-Credits` header of live webhook requests now includes API credits, so it matches the `X-AlsoAsked-Credits` header of API responses. Previously it showed only the plan's credits
* A webhook event that fails because the account has no webhook signing key is no longer retried, and its error says to generate a webhook signing key
* Added the sandbox terms `[server_error]`, which returns a `500` error, `[rate_limit]`, which returns a `429` error with a `Retry-After` header, and `[timeout]`, which simulates a search that runs past the 90 second limit of a synchronous search. Searches with `[server_error]` or `[rate_limit]` cost no sandbox credits
* Sandbox credits are now refunded if a sandbox search fails before it's recorded
* Terms of a deleted search that stall past their deadline are now refunded, as for any other search. Previously deleting a running search kept its credits

## 2026-11-25

* IPv6 clients are now rate limited by their /64 network instead of by their full address, so an IPv6 client can no longer avoid the rate limit by changing addresses within its network

## 2026-11-24
* Searches that specify only one of `latitude` and `longitude` are now refused with a `422` validation error. Previously the lone coordinate was ignored and the region's default location was used
* A `latitude` or `longitude` of `0` is now searched as a real coordinate. Previously `0, 0` was treated as no location

## 2026-11-12

* The `[delay N]` sandbox term is now capped at 3 seconds for each status change, so a sandbox search finishes within about 9 seconds. Previously there was no limit
* Asynchronous sandbox searches now finish within about 9 seconds. Previously each status change waited the delay in seconds instead of milliseconds, so an asynchronous sandbox search could take more than an hour

## 2026-11-09

* Raised the rate limit to 200 requests in a 5 minute window, applied per API key and per IP address

## 2026-07-13

* Released **API v1.1**, available at `https://alsoaskedapi.com/v1.1` and `https://sandbox.alsoaskedapi.com/v1.1`. Changes in v1.1:
  * Fixed child results being duplicated at the top level of the `results` tree - the top level now contains only the root questions, with subquestions nested within their parents. Searches performed through v1 continue to return the previous structure, including in webhook payloads
  * Added a `position` property to each search result, containing the one-based path to the result within the results tree - for example, `[3, 1]` for the first child of the third root question
  * Added a `results_format` query parameter to the `GET /search/{searchId}` endpoint, returning the results as a hierarchy (`tree`, the default) or as a single depth-first ordered list (`flat`) with the nested `results` property omitted
  * Searches that omit the `depth` option now default to a depth of `2`, matching the documented default. Searches performed through v1 continue to default to a depth of `3`
* Added support for a search `depth` of `1`, returning only the top-level questions at a cost of 1 credit per term. This applies to both v1 and v1.1

## 2025-05-20

* Added `ai_overview`, `ai_overview_hrefs`, and `ai_overview_page_titles` properties to search results, indicating whether the result was generated by Google using multiple sources

## 2025-04-10

* Added `latitude` and `longitude` options to search requests
