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
| `plan_type` | string | The plan of the account. On the live API, the value is always `pro`, because the live API returns `402 Payment Required` to an account without a Pro plan. |
| `credits` | integer | The total credits of the account: the value of the `web_credits` field plus the value of the `api_credits` field. |
| `web_credits` | integer | The web credits of the account: the credits that come with the plan. |
| `api_credits` | integer | The API credits of the account: the credits that you bought. |
| `credits_reset_at` | string | The date and time when the web credits of the account renew next, in ISO 8601 format. |
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
| `credits_reset_at` | The date and time when the sandbox credits reset next, 24 hours after the last reset. |

The sandbox API has 1,000 sandbox credits.
For details, see [Sandbox API](./sandbox.md).

## Credits header

Responses from all endpoints of the live API and the sandbox API have the `X-AlsoAsked-Credits` header, not only the
`GET /v1.1/account` endpoint. The value is the number of credits that remain in the account after the request:

- On the live API, the `X-AlsoAsked-Credits` header has the web credits plus the API credits.
- On the sandbox API, the `X-AlsoAsked-Credits` header has the sandbox credits.

Some error responses don't have the header, for example `401 Unauthorized`, `403 Forbidden`, and
`402 Payment Required` with the error type `insufficient_plan`. For the full list, see
[Credits](./credits.md#check-your-credits).

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
  "email": "mantis.toboggan@example.com",
  "plan_type": "pro",
  "credits": 110,
  "web_credits": 100,
  "api_credits": 10,
  "credits_reset_at": "2023-02-01T00:00:00+00:00",
  "registered_at": "2023-01-01T00:00:00+00:00"
}
```

## Teams

If you're a member of a team, the team owner's plan and credits apply to your API requests. The `GET /v1.1/account`
endpoint returns a mix of the two accounts:

| Fields | Whose values |
| --- | --- |
| `id`, `name`, `email`, `registered_at` | Yours, the team member's. |
| `plan_type`, `credits`, `web_credits`, `api_credits`, `credits_reset_at` | The team owner's. |

Your searches use the team owner's credits. Your API keys, your webhook endpoints, your webhook signing key, and your
sandbox credits are your own. AlsoAsked turns API access on or off for each account, so a team member can get the
`api_access_disabled` error even if the team owner can use the API.

In `GET /v1.1/search`, a team member sees only their own searches. A team administrator sees the searches of the team
members, but not the searches of the team owner. The team owner sees every search of the team. For details, see
[Search history](./search-history.md#searches-in-your-search-history).

## If your plan changes

The live API needs a Pro plan. If your account, or the owner of your team, no longer has a Pro plan, these things
happen:

- Every endpoint of the live API returns `402 Payment Required` with the error type `insufficient_plan`, including
  `GET /v1.1/account` and `GET /v1.1/search`.
- Searches that are already running finish, and AlsoAsked still refunds the terms that fail.
- Webhook events for the live API that AlsoAsked hasn't sent yet fail, and AlsoAsked doesn't send them again.
- The sandbox API keeps working.
- AlsoAsked keeps your API keys, webhook endpoints, and API credits. They work again when you have a Pro plan again.

If you cancel a Pro plan, the plan stays active until the end of the period that you paid for. If a payment is overdue,
the Pro plan stops until the payment succeeds.

## Related

- [Authenticate requests](./authentication.md)
- [Credits](./credits.md)
- [Sandbox API](./sandbox.md)
- [OpenAPI specification](../openapi/openapi.yaml)
