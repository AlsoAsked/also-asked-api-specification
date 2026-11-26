---
title: Rate limits
description: Find how the AlsoAsked API counts your requests, which rate limit headers it returns, and what to do when you get a 429 response.
type: reference
---

# Rate limits

The AlsoAsked API limits the number of requests that you can send in a period of time. This page lists how the API
counts your requests, the rate limit headers in each response, and the response that the API returns when you reach the
rate limit.

## How the API counts requests

The rate limit applies to the live API and the sandbox API. AlsoAsked checks the rate limit before AlsoAsked processes
the request.

The rate limit counts your requests by API key and by IP address. AlsoAsked counts an IPv6 address by its /64 network,
so all IPv6 addresses in one /64 network share one rate limit.

The rate limit uses a sliding window. To find the current rate limit, read the `X-RateLimit-Limit` header in any response
from the AlsoAsked API. <!-- PENDING C7: state the limit and the window -->

## Rate limit headers

Every response from the live API and the sandbox API has these rate limit headers:

| Name | Type | Description |
| --- | --- | --- |
| `X-RateLimit-Limit` | Integer | The maximum number of requests that you can send in the window of the rate limit. |
| `X-RateLimit-Remaining` | Integer | The number of requests that you can still send in the current window of the rate limit. |
| `X-RateLimit-Reset` | Integer | The time when the window of the rate limit resets, in Unix time (seconds since 1970-01-01T00:00:00Z). |

## Response when you reach the rate limit

When you reach the rate limit, the AlsoAsked API returns the status code `429 Too Many Requests` with the `Retry-After`
header and this body:

```json
{
  "status": "rate_limit_exceeded",
  "message": "The maximum number of requests per second have been exceeded."
}
```

In your code, use the `status` field of the response body, not the `message` field. The `message` field is text for
people, and AlsoAsked can change the `message` field. The `message` field says "per second" for every rate limit, so
the `message` field doesn't describe your rate limit. To find your rate limit, read the `X-RateLimit-Limit` header.

## `Retry-After` header

The `Retry-After` header in a `429 Too Many Requests` response from the AlsoAsked API gives the time when you can
send requests again. The value of the `Retry-After` header is an HTTP date, for example `Thu, 26 Nov 2026 12:00:30 GMT`.
<!-- PENDING R6: verify Retry-After format -->

## What to do when you get a 429 response

When the AlsoAsked API returns the status code `429 Too Many Requests`:

1. Read the time in the `Retry-After` header of the response.
2. Wait until that time before you send the next request.

Don't send the request again immediately.

## Ask for a higher rate limit

If you need a higher rate limit for the AlsoAsked API, contact `help@alsoasked.com`.

## Example

The following request gets your account from the live API:

```bash
curl --include --request GET 'https://alsoaskedapi.com/v1.1/account' \
  --header 'X-Api-Key: YOUR_API_KEY'
```

If you reached the rate limit, the response has the status code `429 Too Many Requests`, a `Retry-After` header, and
this body:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: Thu, 26 Nov 2026 12:00:30 GMT

{
  "status": "rate_limit_exceeded",
  "message": "The maximum number of requests per second have been exceeded."
}
```

The response also has the rate limit headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`.

## Related

- [Errors](./errors.md)
- [Authenticate requests](./authentication.md)
- [Sandbox API](./sandbox.md)
- [OpenAPI specification](../openapi/openapi.yaml)
