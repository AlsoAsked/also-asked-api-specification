---
stoplight-id: 203mwmqb8ei4k
---

# Account details

The [**`GET /v1/account`**](/docs/also-asked/b3b98451f0ae2-get-account-information) endpoint allows you to view your account details, including the number of credits remaining.

## Endpoint

To get your account details, call the [**`GET /v1/account`**](/docs/also-asked/b3b98451f0ae2-get-account-information) endpoint, with your API key included in the `X-Api-Key` header.

The response will include the following JSON body:

```json
{
  "id": "6G8QgoK9ar0E1pB7Rl0LN5mxljdAvBWb",
  "name": "Mantis Toboggan",
  "email": "mantis.toboggan@gmail.com",
  "plan_type": "pro",
  "credits": 100,
  "credit_reset_date": "2023-02-01T00:00:00Z",
  "registration_date": "2023-01-01T00:00:00Z"
}
```

For more details, see the [**API reference**](/docs/also-asked/b3b98451f0ae2-get-account-information) for the [**`GET /v1/account`**](/docs/also-asked/b3b98451f0ae2-get-account-information) endpoint.

## Try it out

Select the environment you want to try this out in, and enter your API key in the `X-Api-Key` header.

<!--
type: tab
title: Live
-->

```json http
{
  "method": "GET",
  "url": "https://alsoaskedapi.com/v1/account",
  "headers": {
    "Content-Type": "application/json",
    "X-Api-Key": "aa-live-"
  }
}
```

<!--
type: tab
title: Sandbox
-->

```json http
{
  "method": "GET",
  "url": "https://sandbox.alsoaskedapi.com/v1/account",
  "headers": {
    "Content-Type": "application/json",
    "X-Api-Key": "aa-sandbox-"
  }
}
```

<!-- type: tab-end -->
