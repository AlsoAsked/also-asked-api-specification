---
title: Errors
description: Find the error types that the AlsoAsked API returns, what each error type means, and what to do about it.
type: reference
---

# Errors

When the AlsoAsked API can't complete a request, it returns an error response. This page lists the body of an error
response, every error type with its status code, and what to do for each error type.

## Error body

Every error response from the AlsoAsked API has a JSON body with these fields:

| Field | Type | Description |
| --- | --- | --- |
| `status` | string | The error type, for example `insufficient_credits`. Use the `status` field in your code to decide what to do. |
| `message` | string | A description of the error for people to read. The text of the `message` field can change, so don't use it in your code. |
| `errors` | array | Only in a `validation` error: the fields, parameters, or headers that aren't valid. See [Validation errors](#validation-errors). |

For example, the following error body has the error type `insufficient_credits`:

```json
{
  "status": "insufficient_credits",
  "message": "You don't have enough credits to perform this request."
}
```

## Error types

The following table lists every error type that the AlsoAsked API returns. The error type is the value of the `status`
field in the error body.

| Status code | Error type | Meaning | What to do |
| --- | --- | --- | --- |
| `400 Bad Request` | `invalid_body` | The request body isn't valid JSON. | Send a request body that's valid JSON. A body that's valid JSON but has the wrong fields or types gets the error type `validation` instead. |
| `401 Unauthorized` | `missing_api_key` | The request doesn't have the `X-Api-Key` header. | Put your API key in the `X-Api-Key` header of every request. See [Authenticate requests](./authentication.md). |
| `401 Unauthorized` | `api_access_disabled` | AlsoAsked turned off API access for your account. | Contact AlsoAsked support at `support@alsoasked.com`. |
| `402 Payment Required` | `insufficient_plan` | The live API needs a Pro plan, and your account doesn't have a Pro plan. | Change your plan to Pro, or use the sandbox API, which doesn't need a Pro plan. |
| `402 Payment Required` | `insufficient_credits` | Your account doesn't have enough credits for the search. | Check the credits in your account, or perform the search with fewer terms or a lower depth. See [Credits](./credits.md). |
| `403 Forbidden` | `invalid_api_key` | The `X-Api-Key` header is empty, its value isn't a valid API key, the API key no longer exists, or the API key is for the other API. A live API key works only on the live API, and a sandbox API key works only on the sandbox API. | Check that the API key in the `X-Api-Key` header exists and matches the API that you send the request to. See [Authenticate requests](./authentication.md). |
| `404 Not Found` | `not_found` | The search isn't in your search history: it doesn't exist, it belongs to another account, or it's older than the history limit of your plan. `DELETE /v1.1/search/{searchId}` also returns this error for a search that you already deleted. | Check the `searchId` path parameter, and use an API key of the account that performed the search. See [Manage your search history](./search-history.md). |
| `422 Unprocessable Content` | `validation` | A field, a parameter, or a header of the request isn't valid. The `errors` field names it. | Correct the field, parameter, or header that the `errors` field names, then send the request again. See [Validation errors](#validation-errors). |
| `429 Too Many Requests` | `rate_limit_exceeded` | You sent more requests than the rate limit allows. | Wait until the time in the `Retry-After` header, then send the request again. See [Rate limits](./rate-limits.md). |
| `500 Internal Server Error` | `internal_server` | An error happened in AlsoAsked. | Send the request again later. If the `POST /v1.1/search` endpoint returns this error, AlsoAsked refunded the credits of every term that isn't complete, so you don't pay twice. See [Internal server errors](#internal-server-errors). |

## Internal server errors

A `500 Internal Server Error` response is safe to send again when its body has the `status` field with the value
`internal_server`:

- If the `POST /v1.1/search` endpoint returns this error, AlsoAsked refunded the credits of every term that isn't
  complete. If AlsoAsked already recorded the search, those terms have the status `error` in your search history.
- If the check of the rate limit itself fails, the response has this body too, but no rate limit headers and no
  `X-AlsoAsked-Credits` header. AlsoAsked didn't process the request.

If a `500 Internal Server Error` response has no `status` field, or if you get no response, AlsoAsked may still have
recorded and charged a search. Check your search history before you send a `POST /v1.1/search` request again. See
[Find a search after a lost response](./search-history.md#find-a-search-after-a-lost-response).

## Validation errors

The AlsoAsked API returns the status code `422 Unprocessable Content` with the error type `validation` when a field, a
parameter, or a header of the request isn't valid. AlsoAsked doesn't charge credits for the request. If one term of a
search isn't valid, AlsoAsked rejects the whole search, and searches for none of its terms.

The `errors` field of a `validation` error is a list. Each item has 2 fields:

| Field | Type | Description |
| --- | --- | --- |
| `field` | string or `null` | Where the problem is. For a field of the request body, the path to the field, with a `.` between the parts: for example, `depth`, or `terms.3` for the fourth term (the index starts at 0). For a query parameter, a path parameter, or a header, its name: for example, `count`, `searchId`, or `Content-Type`. `null` if the problem isn't with one field. |
| `message` | string | A description of the problem for people to read. The text can change, so don't use it in your code. |

AlsoAsked stops at the first problem that it finds, so the `errors` field has one item. Write your code to accept more
than one item.

Use the `field` field in your code to find the problem. For example, if the value of the `field` field is `terms.3`,
remove or correct the fourth term, then perform the search again.

These requests also get a `validation` error:

- A request to the `POST /v1.1/search` endpoint without the `Content-Type: application/json` header. The `field` field
  is `Content-Type`.
- A request with a search ID that isn't 32 letters and digits, for example `GET /v1.1/search/abc`. The `field` field is
  `searchId`.
- A request body that's valid JSON but isn't a JSON object, for example a string or a list of terms. The `field` field
  is `null`.
- A field with the value `null`. To use the default value of an optional field, leave the field out.
- A term that has only whitespace, double quotes (`"`), and invisible characters, such as a zero-width space.

## Responses in other formats

Some responses don't come from the AlsoAsked API itself, so they don't have the body that the [Error body](#error-body)
section describes:

- **A path or method that the AlsoAsked API doesn't have:** for example, `GET /v2/search` or `PUT /v1.1/search`. The
  status code is `404 Not Found` or `405 Method Not Allowed`. Check the URL, the version in the URL, and the method.
- **An unexpected error in AlsoAsked:** the status code is `500 Internal Server Error`. Send the request again later.
  If the request was `POST /v1.1/search`, check your search history first, because AlsoAsked may have recorded the
  search. See [Find a search after a lost response](./search-history.md#find-a-search-after-a-lost-response).
- **A request body larger than 8 MB:** the status code is `413 Content Too Large`, and the body is an HTML page. A
  search with 1,000 terms of normal length is much smaller than this limit.

For an unknown path or method and for an unexpected error, the body is `{"message": "..."}` if the request has the
`Accept: application/json` header, and an HTML page otherwise. Send the `Accept: application/json` header with every
request, and handle a response without the `status` field as an error that you identify by its status code.

## Example

The following request performs a search with 4 terms. The fourth term has only spaces:

```bash
curl --request POST 'https://alsoaskedapi.com/v1.1/search' \
  --header 'Content-Type: application/json' \
  --header 'X-Api-Key: YOUR_LIVE_API_KEY' \
  --data '{
    "terms": ["how to brew coffee", "how to brew tea", "how to grind beans", "   "],
    "language": "en",
    "region": "us",
    "depth": 2
  }'
```

The API returns the status code `422 Unprocessable Content` with the following body. AlsoAsked doesn't search for any
of the 4 terms, and doesn't charge credits:

```json
{
  "status": "validation",
  "message": "terms -> 3: must contain text other than spaces and quotes.",
  "errors": [
    {
      "field": "terms.3",
      "message": "must contain text other than spaces and quotes."
    }
  ]
}
```

## Related

- [Authenticate requests](./authentication.md)
- [Rate limits](./rate-limits.md)
- [Credits](./credits.md)
- [Perform a search](./perform-a-search.md)
- [Manage your search history](./search-history.md)
- [OpenAPI specification](../openapi/openapi.yaml)
