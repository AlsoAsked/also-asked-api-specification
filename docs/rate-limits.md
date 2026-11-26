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

The rate limit counts your requests by API key and by IP address, separately. Each API key has its own count, and each
IP address has its own count. AlsoAsked refuses a request if the count for the API key or the count for the IP address
has reached the limit. A refused request doesn't count. AlsoAsked counts an IPv6 address by its /64 network, so all
IPv6 addresses in one /64 network share one count.

Each API key and each IP address can send a maximum of 200 requests in 5 minutes.

The rate limit uses a sliding window. AlsoAsked counts the requests that you sent in the last window, measured back from
now. When a request is older than the window, the request stops counting. The `X-RateLimit-Limit` header in each
response from the AlsoAsked API also shows the limit.

## Rate limit headers

Every response from the live API and the sandbox API has these rate limit headers:

| Name | Type | Description |
| --- | --- | --- |
| `X-RateLimit-Limit` | Integer | The maximum number of requests that you can send in the window of the rate limit. |
| `X-RateLimit-Remaining` | Integer | The number of requests that you can still send now. It's the lower of the remaining requests for your API key and for your IP address. |
| `X-RateLimit-Reset` | Integer | The current time plus the length of the window, in Unix time (seconds since 1970-01-01T00:00:00Z). A request that you send now stops counting at this time. To find the length of the window, subtract the current time from this value. |

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
send requests again: the time when your oldest counted request stops counting. The value of the `Retry-After` header is
an HTTP date in Coordinated Universal Time (UTC), for example `Thu, 26 Nov 2026 12:00:30 GMT`.

## What to do when you get a 429 response

When the AlsoAsked API returns the status code `429 Too Many Requests`:

1. Read the time in the `Retry-After` header of the response.
2. Wait until that time before you send the next request.

Don't send the request again immediately.

## Ask for a higher rate limit

If you need a higher rate limit for the AlsoAsked API, contact `support@alsoasked.com`.

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
