---
title: Rate limits
description: Find how the AlsoAsked API counts your requests, which rate limit headers it returns, and what to do when you get a 429 response.
type: reference
---

# Rate limits

The AlsoAsked API limits the number of requests that you can send in a period of time: each API key and each IP
address can send a maximum of 200 requests in 5 minutes. This page lists how the API counts your requests, the rate
limit headers in each response, and the response that the API returns when you reach the rate limit.

## How the API counts requests

Each API key and each IP address can send a maximum of 200 requests in 5 minutes. The rate limit applies to the live
API and the sandbox API. AlsoAsked checks the rate limit before AlsoAsked processes the request.

The rate limit counts your requests by API key and by IP address, separately. Each API key has its own count, and each
IP address has its own count. AlsoAsked refuses a request with the status code `429 Too Many Requests` if the count for
the API key or the count for the IP address has reached the limit. AlsoAsked counts an IPv6 address by its /64 network,
so all IPv6 addresses in one /64 network share one count.

- Each IP address has one count for the live API and the sandbox API together. A request to the sandbox API takes one
  of the requests that you could send to the live API from the same IP address.
- Every request counts, except a request that AlsoAsked refuses with `429 Too Many Requests`. A request that gets
  another error also counts, for example `401 Unauthorized` for a missing API key or `403 Forbidden` for an API key
  that isn't valid.
- AlsoAsked counts by the value of the `X-Api-Key` header, even if the value isn't a valid API key. A request without
  the `X-Api-Key` header, or with an empty `X-Api-Key` header, counts only for its IP address.

The rate limit uses a sliding window of 5 minutes. AlsoAsked counts the requests that you sent in the last 5 minutes,
measured back from now. When a request is older than 5 minutes, the request stops counting. The `X-RateLimit-Limit`
header in each response from the AlsoAsked API also shows the limit.

## Rate limit headers

Every response from the live API and the sandbox API has these rate limit headers, with the 2 exceptions after the
table:

| Name | Type | Description |
| --- | --- | --- |
| `X-RateLimit-Limit` | integer | The maximum number of requests that you can send in the window of the rate limit. |
| `X-RateLimit-Remaining` | integer | The number of requests that you can still send now. It's the lower of the remaining requests for your API key and for your IP address. |
| `X-RateLimit-Reset` | integer | The current time plus the 5 minutes of the window, in Unix time (seconds since 1970-01-01T00:00:00+00:00). A request that you send now stops counting at this time. |

These responses don't have the rate limit headers:

- A `500 Internal Server Error` response when the check of the rate limit itself fails.
- A `413 Content Too Large` response for a request body larger than 8 MB.

## Response when you reach the rate limit

When you reach the rate limit, the AlsoAsked API returns the status code `429 Too Many Requests` with the `Retry-After`
header and this body:

```json
{
  "status": "rate_limit_exceeded",
  "message": "The rate limit has been exceeded. Wait until the time in the Retry-After header, then send the request again."
}
```

In your code, use the `status` field of the response body, not the `message` field. The `message` field is text for
people, and AlsoAsked can change the `message` field. To find your rate limit, read the `X-RateLimit-Limit` header.

## `Retry-After` header

The `Retry-After` header in a `429 Too Many Requests` response from the AlsoAsked API gives the time when you can
send requests again. This is the time when the oldest request in the count that reached the limit stops counting. If
both the count of your API key and the count of your IP address reached the limit, the later of the 2 times applies.
The value of the `Retry-After` header is an HTTP date in the RFC 1123 format, in Greenwich Mean Time (GMT), for example
`Thu, 26 Nov 2026 12:00:30 GMT`.

## What to do when you get a 429 response

When the AlsoAsked API returns the status code `429 Too Many Requests`:

1. Read the time in the `Retry-After` header of the response.
2. Wait until that time before you send the next request.

Don't send the request again immediately.

## Example

The following request gets your account from the live API:

```bash
curl --include --request GET 'https://alsoaskedapi.com/v1.1/account' \
  --header 'X-Api-Key: YOUR_LIVE_API_KEY'
```

If you reached the rate limit, the response has the status code `429 Too Many Requests`, a `Retry-After` header, the
rate limit headers, and the error body:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: Thu, 26 Nov 2026 12:00:30 GMT
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1795694700

{
  "status": "rate_limit_exceeded",
  "message": "The rate limit has been exceeded. Wait until the time in the Retry-After header, then send the request again."
}
```

To test how your code handles a `429 Too Many Requests` response, use the `[rate_limit]` test term of the sandbox API.
See [Sandbox API](./sandbox.md#test-terms).

## Related

- [Errors](./errors.md)
- [Authenticate requests](./authentication.md)
- [Sandbox API](./sandbox.md)
- [Search many terms](./bulk-searches.md)
- [OpenAPI specification](../openapi/openapi.yaml)
