---
title: Errors
description: Find the error types that the AlsoAsked API returns, what each error type means, and what to do about it.
type: reference
---

# Errors

When the AlsoAsked API can't complete a request, it returns an error response. This page lists the body of an error
response, every error type with its status code, and what to do for each error type.

## Error body

Every error response from the AlsoAsked API has a JSON body with two fields:

| Field | Type | Description |
| --- | --- | --- |
| `status` | string | The error type, for example `validation`. Use the `status` field in your code to decide what to do. |
| `message` | string | A description of the error for people to read. The text of the `message` field can change, so don't use it in your code. |

For example, the following error body has the error type `validation`:

```json
{
  "status": "validation",
  "message": "terms -> 0: must contain text other than spaces and quotes."
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
| `403 Forbidden` | `invalid_api_key` | The value of the `X-Api-Key` header isn't a valid API key, the API key no longer exists, or the API key is for the other API. A live API key works only on the live API, and a sandbox API key works only on the sandbox API. | Check that the API key in the `X-Api-Key` header exists and matches the API that you send the request to. See [Authenticate requests](./authentication.md). |
| `404 Not Found` | `not_found` | The search doesn't exist, or the search belongs to another account. | Check the `searchId` path parameter, and use an API key of the account that performed the search. |
| `422 Unprocessable Content` | `validation` | A field or a parameter in the request isn't valid. The `message` field names the field or the parameter. | Correct the field or the parameter that the `message` field names, then send the request again. See [Validation errors](#validation-errors). |
| `429 Too Many Requests` | `rate_limit_exceeded` | You sent more requests than the rate limit allows. | Wait until the time in the `Retry-After` header, then send the request again. See [Rate limits](./rate-limits.md). |
| `500 Internal Server Error` | `internal_server` | An error happened in AlsoAsked. | Send the request again later. If a search fails with the `internal_server` error type, AlsoAsked refunds the credits of the search. |

## Validation errors

The AlsoAsked API returns the status code `422 Unprocessable Content` with the error type `validation` when a field or a
parameter in the request isn't valid. The `message` field in the error body names the field or the parameter and says
what's wrong. For example:

- `terms -> 0: must contain text other than spaces and quotes.` The first term in the `terms` field has only spaces or
  quotes.
- `latitude and longitude must be provided together.` The request has the `latitude` field without the `longitude`
  field, or the `longitude` field without the `latitude` field.

Use the `message` field of a `validation` error only to find the field or the parameter to correct. Use the `status`
field, not the `message` field, in your code.

## Example

The following request performs a search with a term that has only spaces:

```bash
curl --request POST 'https://alsoaskedapi.com/v1.1/search' \
  --header 'Content-Type: application/json' \
  --header 'X-Api-Key: YOUR_API_KEY' \
  --data '{
    "terms": ["   "],
    "language": "en",
    "region": "us",
    "depth": 2
  }'
```

The API returns the status code `422 Unprocessable Content` with the following body:

```json
{
  "status": "validation",
  "message": "terms -> 0: must contain text other than spaces and quotes."
}
```

## Related

- [Authenticate requests](./authentication.md)
- [Rate limits](./rate-limits.md)
- [Credits](./credits.md)
- [OpenAPI specification](../openapi/openapi.yaml)
