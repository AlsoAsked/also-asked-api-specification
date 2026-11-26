---
title: Account details
description: Find the fields that the GET /v1.1/account endpoint returns, and the X-AlsoAsked-Credits header that shows your remaining credits.
type: reference
---

# Account details

The `GET /v1.1/account` endpoint returns the account that owns the API key in the request. This page lists the fields
in the response body, how the sandbox API changes them, and the `X-AlsoAsked-Credits` header.

## Account endpoint

Send a request to the `GET /v1.1/account` endpoint to get the details of your account. The API returns the account that
owns the API key in the `X-Api-Key` header of the request.

| API | URL |
| --- | --- |
| Live API | `https://alsoaskedapi.com/v1.1/account` |
| Sandbox API | `https://sandbox.alsoaskedapi.com/v1.1/account` |

## Account fields

The response body of the `GET /v1.1/account` endpoint is a JSON object with these fields. On the sandbox API, the credit
fields and the `plan_type` field have different values. For details, see
[Account fields on the sandbox API](#account-fields-on-the-sandbox-api).

| Name | Type | Description |
| --- | --- | --- |
| `id` | string | The ID of the account. |
| `name` | string | The name of the account. |
| `email` | string | The email address of the account. |
| `plan_type` | string | The plan of the account. The value is `free`, `basic`, `lite`, or `pro`. |
| `credits` | integer | The total credits of the account: the value of the `web_credits` field plus the value of the `api_credits` field. |
| `web_credits` | integer | The web credits of the account. Web credits pay for searches on the AlsoAsked website and on the AlsoAsked API. |
| `api_credits` | integer | The API credits of the account. API credits pay for searches on the AlsoAsked API when no web credits remain. |
| `credits_reset_at` | string | The date and time when the web credits of the account renew, in ISO 8601 format. |
| `registered_at` | string | The date and time of the registration of the account, in ISO 8601 format. |

## Account fields on the sandbox API

The sandbox API has its own credits, which are separate from the credits of your plan. On the sandbox API, the
`GET /v1.1/account` endpoint returns the sandbox credits in the account fields:

| Name | Value on the sandbox API |
| --- | --- |
| `credits` | The sandbox credits. |
| `web_credits` | The sandbox credits. |
| `api_credits` | `0` |
| `plan_type` | `pro` |

The sandbox API has 1,000 sandbox credits.
For details, see [Sandbox API](./sandbox.md).

## Credits header

Every response from the live API and the sandbox API has the `X-AlsoAsked-Credits` header. The value of the
`X-AlsoAsked-Credits` header is the number of credits that remain in the account:

- On the live API, the `X-AlsoAsked-Credits` header has the web credits plus the API credits.
- On the sandbox API, the `X-AlsoAsked-Credits` header has the sandbox credits.

The `X-AlsoAsked-Credits` header is in the responses of all endpoints, not only the `GET /v1.1/account` endpoint.

## Example

The following request gets the account details from the live API:

```bash
curl --request GET 'https://alsoaskedapi.com/v1.1/account' \
  --header 'X-Api-Key: YOUR_API_KEY'
```

The following JSON is an example response body from the `GET /v1.1/account` endpoint:

```json
{
  "id": "6G8QgoK9ar0E1pB7Rl0LN5mxljdAvBWb",
  "name": "Mantis Toboggan",
  "email": "mantis.toboggan@gmail.com",
  "plan_type": "pro",
  "credits": 110,
  "web_credits": 100,
  "api_credits": 10,
  "credits_reset_at": "2023-02-01T00:00:00Z",
  "registered_at": "2023-01-01T00:00:00Z"
}
```

## Related

- [Authenticate requests](./authentication.md)
- [Credits](./credits.md)
- [Sandbox API](./sandbox.md)
- [OpenAPI specification](../openapi/openapi.yaml)
