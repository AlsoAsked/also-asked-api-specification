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

The test results contain placeholder text. They aren't real questions and answers. For each term, a search on the sandbox API
gets 4 top-level results. Each result at a lower level of the search has 6 to 10 child results, up to the depth of the
search. About 1 in 4 results is an AI overview, with 2 to 5 sources.

The test results are deterministic. If you perform two searches on the sandbox API with the same terms, language code,
region code, latitude, longitude, and depth, both searches get the same test results. Because of this, you can write
automated tests that check the test results.

## Sandbox credits

The sandbox API has its own credits: 1,000 sandbox credits. Sandbox
credits are separate from the credits of your plan. A search on the sandbox API uses sandbox credits only.

To see your sandbox credits, send a request to `GET https://sandbox.alsoaskedapi.com/v1.1/account`. In the response body
from the sandbox API, the fields show the sandbox credits:

- The `credits` field and the `web_credits` field contain the sandbox credits.
- The `api_credits` field is `0`.
- The `plan_type` field is `pro`.

Every response from the sandbox API also has the `X-AlsoAsked-Credits` header. On the sandbox API, the
`X-AlsoAsked-Credits` header contains the sandbox credits that remain.

## Reset of sandbox credits

Sandbox credits reset to the full amount 24 hours after the last reset. The `credits_reset_at` field in the response
body of `GET https://sandbox.alsoaskedapi.com/v1.1/account` shows when the next reset of the sandbox credits happens.

## Test terms

A test term changes how a search on the sandbox API behaves. To use a test term, add the test term as one of the terms in
the `terms` field of the `POST https://sandbox.alsoaskedapi.com/v1.1/search` request body. Each term gets its own result,
the same as on the live API.

| Term | Result of the term |
| --- | --- |
| `[error]` | The term fails, with no results. |
| `[no_results]` | The term finishes with no results. |
| `[delay N]` | The term gets the same result as the search. The test term also sets the delay between status changes to N seconds. The maximum value of N is 3. N can have decimals, for example `[delay 0.5]`. |
| Any other term | The term succeeds, with test results. |

If the search has no `[delay N]` test term, the delay between status changes is a random value from 1 to 3 seconds.

The status of the search comes from the results of its terms, the same as on the live API:

- If at least one term succeeds, the status of the search is `success`.
- If no term succeeds, and at least one term has no results, the status of the search is `no_results`.
- If every term fails, the status of the search is `error`.

The order of the terms doesn't matter. When the status of the search is `success`, the `queries` field has one query for
each term. A query for an `[error]` term or a `[no_results]` term has `null` in its `results`, `language_fallback`, and
`region_fallback` fields. AlsoAsked refunds the sandbox credits for the `[error]` terms and the `[no_results]` terms.

A search on the sandbox API goes through these statuses, in this order: `running`, `fetching`, and then the final status.
The delay happens before each status change.

The following request performs an asynchronous search on the sandbox API. The `how to brew coffee` term succeeds and the
`[error]` term fails, so the status of the search is `success`. The `[delay 1]` test term sets the delay between status
changes to 1 second:

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
