---
title: Sandbox API
description: Learn what the sandbox API is, how it differs from the live API, and how to use test terms to test your integration.
type: concept
---

# Sandbox API

The sandbox API is the AlsoAsked API for testing. It returns test results and uses sandbox credits, not the credits of
your plan. Use the sandbox API while you develop your integration, then change to the live API when your integration is
ready.

## What the sandbox API is for

The sandbox API has the same endpoints, request bodies, and response bodies as the live API:

- `GET /v1.1/account`
- `GET /v1.1/search`
- `POST /v1.1/search`
- `GET /v1.1/search/{searchId}`
- `DELETE /v1.1/search/{searchId}`

Because the requests and responses are the same, you can move your integration from the sandbox API to the live API by
changing the base URL and the API key. On the live API, searches get real results from Google and use the credits of
your plan, and the test terms on this page have no special effect.

The sandbox API doesn't need a Pro plan. Any AlsoAsked account can use the sandbox API. The live API needs a Pro plan.

## Base URL and sandbox API keys

The base URL of the sandbox API is `https://sandbox.alsoaskedapi.com/v1.1`. The base URL of the live API is
`https://alsoaskedapi.com/v1.1`.

Each request to the sandbox API needs a sandbox API key in the `X-Api-Key` header. A sandbox API key starts with
`aa-sandbox-`. A live API key starts with `aa-live-`.

A sandbox API key works only on the sandbox API, and a live API key works only on the live API. If you send a live API
key to the sandbox API, the sandbox API rejects the key as invalid. For details about API keys, see
[Authenticate requests](./authentication.md).

## Test results

The sandbox API doesn't get results from Google. A search on the sandbox API returns test results that AlsoAsked
generates from the request.

The test results contain placeholder text in Latin. They aren't real questions and answers. For each term that
succeeds, a search on the sandbox API gets 4 top-level results. Each result at a level lower than the depth of the search
has 6 to 10 child results. About 1 in 4 results is an AI overview, with 2 to 5 sources. About 1 in 10 queries has `true` in the
`language_fallback` field, and about 1 in 10 has `true` in the `region_fallback` field.

The test results are deterministic. If you perform two searches on the sandbox API with the same terms in the same
order, and the same language code, region code, latitude, longitude, and depth, both searches get the same test
results. The test results of a term depend on all the terms of the search and their order, so the same term can get
different test results in a different search.

The sandbox API never uses stored results. The `cached` field is always `false`, and the `cached_at` field is always
`null`.

## Sandbox credits

The sandbox API has its own credits: 1,000 sandbox credits. Sandbox
credits are separate from the credits of your plan. A search on the sandbox API uses sandbox credits only.

To see your sandbox credits, send a request to `GET https://sandbox.alsoaskedapi.com/v1.1/account`. In the response body
from the sandbox API, the fields show the sandbox credits:

- The `credits` field and the `web_credits` field contain the sandbox credits.
- The `api_credits` field is `0`.
- The `plan_type` field is `pro`.

Responses from the sandbox API also have the `X-AlsoAsked-Credits` header, except when the request has no API key or an
API key that AlsoAsked doesn't accept. On the sandbox API, the
`X-AlsoAsked-Credits` header contains the sandbox credits that remain.

## Reset of sandbox credits

Sandbox credits reset to the full amount 24 hours after the last reset. The `credits_reset_at` field in the response
body of `GET https://sandbox.alsoaskedapi.com/v1.1/account` shows when the next reset of the sandbox credits happens.

## Test terms

A test term changes how a search on the sandbox API behaves. To use a test term, add the test term as one of the terms in
the `terms` field of the `POST https://sandbox.alsoaskedapi.com/v1.1/search` request body. Test terms are lowercase,
and must match exactly.

These test terms set the result of their own term, the same as a term on the live API:

| Term | Result of the term |
| --- | --- |
| `[error]` | The term fails with the status `error` and no results. |
| `[no_results]` | The term finishes with the status `no_results` and no results. |
| Any other term | The term succeeds with the status `success` and test results. |

These test terms change the timing of the search. Their own term gets the same status as the search:

| Term | Effect |
| --- | --- |
| `[delay N]` | Sets the delay before each status change to N seconds. N starts with a digit and can have decimals, for example `[delay 0.5]`. A value greater than 3 counts as 3. |
| `[timeout]` | The search runs past the 90 seconds that a synchronous search waits. See [Test a search that runs past the timeout](#test-a-search-that-runs-past-the-timeout). |

These test terms make the request fail, so you can test how your integration handles errors. AlsoAsked doesn't record
the search, doesn't charge sandbox credits, and doesn't send webhook events:

| Term | Response |
| --- | --- |
| `[server_error]` | `500 Internal Server Error` with the error type `internal_server`. |
| `[rate_limit]` | `429 Too Many Requests` with the error type `rate_limit_exceeded`, and a `Retry-After` header 10 seconds after the request. |

The `[rate_limit]` response comes from the sandbox API, not from the rate limiter, so its `X-RateLimit-Remaining`
header shows your real number of remaining requests, not `0`. For details about the real rate limit, see
[Rate limits](./rate-limits.md).

## Status changes and timing

A search on the sandbox API starts with the status `pending`, then goes through `running`, `fetching`, and then the
final status. AlsoAsked waits before each of the three status changes:

- In a synchronous search, each wait is a new random value from 1 to 3 seconds, so the response comes after 3 to 9
  seconds.
- In an asynchronous search, AlsoAsked chooses one random value from 1 to 3 seconds and uses it for all three waits.
- With a `[delay N]` test term, each wait is N seconds. If the search has more than one `[delay N]` test term, the first
  one counts.

The status of the search comes from the results of its terms, the same as on the live API:

- If at least one term succeeds, the status of the search is `success`.
- If no term succeeds, and at least one term has no results, the status of the search is `no_results`.
- If every term fails, the status of the search is `error`.
- If the search has only `[delay N]` and `[timeout]` terms, the status of the search is `success`.

The order of the terms doesn't change the status. When the search is complete, the `queries` field has one query for
each term, and each query has its own `status` field. A query with the status `error` or `no_results` has `null` in its
`results`, `language_fallback`, and `region_fallback` fields.

## Sandbox credits for test terms

Every term costs sandbox credits, including test terms, except in a request that has `[server_error]` or
`[rate_limit]`. When the search is complete, AlsoAsked refunds the sandbox credits of the terms with the status
`error` or `no_results`. If the status of the whole search is `error` or `no_results`, AlsoAsked refunds the sandbox
credits of every term.

## Test a search that runs past the timeout

On the live API, a synchronous search returns after 90 seconds even if the search isn't complete. The search keeps
running, and your integration has to get the results later. To test this, add the `[timeout]` test term:

- In a synchronous search, the sandbox API returns immediately with the status `fetching` and `null` in the `queries`
  field, the same response that the live API gives after 90 seconds. The sandbox API doesn't wait the 90 seconds.
- In an asynchronous search, the search goes through `running` and `fetching` as usual.

In both modes, the search is complete 2 minutes after you perform it: the 90 seconds of the timeout plus 30 seconds.
Get the results with `GET https://sandbox.alsoaskedapi.com/v1.1/search/{searchId}` or from the webhook events.

## Example

The following request performs an asynchronous search on the sandbox API. The `how to brew coffee` term succeeds and the
`[error]` term fails, so the status of the search is `success`. The `[delay 1]` test term sets the delay before each
status change to 1 second:

```bash
curl --request POST 'https://sandbox.alsoaskedapi.com/v1.1/search' \
  --header 'Content-Type: application/json' \
  --header 'X-Api-Key: YOUR_SANDBOX_API_KEY' \
  --data '{
    "terms": ["how to brew coffee", "[error]", "[delay 1]"],
    "async": true
  }'
```

Replace `YOUR_SANDBOX_API_KEY` with your sandbox API key, which starts with `aa-sandbox-`. For more information about
the `async` field, see [Synchronous and asynchronous searches](./searches.md).

When the search is complete, the `how to brew coffee` query has the status `success`, the `[error]` query has the
status `error`, and the `[delay 1]` query has the status `success`, the status of the search. AlsoAsked refunds the
sandbox credits of the `[error]` term.

## What the sandbox API can't test

The sandbox API doesn't have these behaviors of the live API, so test them another way:

- **Stored results:** the sandbox API always gets new test results, so every term costs sandbox credits.
- **The plan error:** the sandbox API doesn't need a Pro plan, so it never returns `insufficient_plan`.
- **The real rate limit:** use the `[rate_limit]` test term to test your handling of a `429` response.
- **Long searches:** sandbox searches finish within seconds, or 2 minutes with `[timeout]`. On the live API, a search
  with many terms can take up to an hour. See [Synchronous and asynchronous searches](./searches.md).

## Webhook events from the sandbox API

For a search on the sandbox API, AlsoAsked sends webhook events to your sandbox webhook endpoints. AlsoAsked sends these
webhook events only if the `notify_webhooks` field in the `POST https://sandbox.alsoaskedapi.com/v1.1/search` request body is
`true`. For details about webhook events, see [Webhooks](./webhooks.md).

## Get more sandbox credits

If you need more sandbox credits, or a faster reset of sandbox credits, contact
[support@alsoasked.com](mailto:support@alsoasked.com).

## Related

- [Authenticate requests](./authentication.md)
- [Synchronous and asynchronous searches](./searches.md)
- [Webhooks](./webhooks.md)
- [OpenAPI specification](../openapi/openapi.yaml)
