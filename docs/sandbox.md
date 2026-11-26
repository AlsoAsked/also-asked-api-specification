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

The test results are deterministic. If you perform two searches on the sandbox API with the same terms, language code,
region code, latitude, longitude, and depth, both searches get the same test results. Because of this, you can write
automated tests that check the test results.

## Sandbox credits

The sandbox API has its own credits: 1,000 sandbox credits. <!-- PENDING C3: confirm production value --> Sandbox
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
the `terms` field of the `POST https://sandbox.alsoaskedapi.com/v1.1/search` request body.

| Test term | What the test term does |
| --- | --- |
| `[error]` | The search ends with the `error` status. |
| `[no_results]` | The search ends with the `no_results` status. |
| `[delay N]` | Sets the delay between status changes to N seconds. The maximum value of N is 3. N can have decimals, for example `[delay 0.5]`. |

If the search has no `[error]` test term and no `[no_results]` test term, the search ends with the `success` status. If
the search has no `[delay N]` test term, the delay between status changes is a random value from 1 to 3 seconds.

A search on the sandbox API goes through these statuses, in this order: `running`, `fetching`, and then the final status.
The final status is `success`, `error`, or `no_results`. The delay happens before each status change.

The following request performs an asynchronous search on the sandbox API. Because of the `[error]` test term, the search ends
with the `error` status, and the `[delay 1]` test term sets the delay between status changes to 1 second:

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
[help@alsoasked.com](mailto:help@alsoasked.com).

## Related

- [Authenticate requests](./authentication.md)
- [Synchronous and asynchronous searches](./searches.md)
- [Webhooks](./webhooks.md)
- [OpenAPI specification](../openapi/openapi.yaml)
