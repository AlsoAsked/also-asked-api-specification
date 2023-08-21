---
stoplight-id: ka0yym68ltyoi
---

# Rate limiting

The AlsoAsked API uses rate limiting to ensure fair usage of the API. The rate limits are applied both per API key and IP address.

We allow for 100 requests to made in a 5 minute window. If you exceed this limit, you will receive a `429 Too Many Requests` response.

<!-- theme: info -->
> #### Rate limiting algorithm
>
> We use an algorithm called the Sliding Window Counter to track the number of requests made in a 5 minute window. This algorithm is used by many popular APIs, including the [GitHub API](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting).
>
> In short, it means that the rate limit counter is decreased 5 minutes after a request is made.
>
> This means that if you make a request at 12:00, the counter will be decreased at 12:05. If you make another request at 12:04, the counter will be decreased at 12:09.

## Rate limit headers

When you make a request to the API, we include the following headers in the response:

| Header | Description |
| --- | --- |
| `X-RateLimit-Limit` | The maximum number of requests that can be made in a 5 minute window. |
| `X-RateLimit-Remaining` | The number of requests remaining in the current 5 minute window. |
| `X-RateLimit-Reset` | The time at which the current 5 minute window will reset, in [Unix time](https://en.wikipedia.org/wiki/Unix_time). |

When you hit the request limit, we also include the following header:

| Header | Description |
| --- | --- |
| `Retry-After` | The number of seconds until the rate limit resets. |

You can determine the number of seconds until the rate limit resets by subtracting the current Unix time from the `X-RateLimit-Reset` header.

## Rate limit response

When you hit the request limit, you will receive a `429 Too Many Requests` response. The response will include the following JSON body:

```json
{
  "status": "rate_limit_exceeded",
  "message": "The maximum number of requests per second have been exceeded."
}
```

When this happens, use the `Retry-After` header to determine how long to wait before making another request.

<!-- theme: info -->
> #### Rate limit exceeded
>
> If you receive a `429 Too Many Requests` response, you should wait until the rate limit resets before making another request.
>
> You won't be able to make any requests until the rate limit resets, even if you use a different API key or IP address.
>
> If you continue to receive this response, or believe you need a higher request
>  limit, please [contact us](mailto:help@alsoasked.com).
