---
title: Authenticate requests
description: Create an API key and send it in the X-Api-Key header, so that the AlsoAsked API accepts your requests.
type: task
---

# Authenticate requests

The AlsoAsked API uses an API key to identify your account. Every request to the live API or the sandbox API must
include an API key in the `X-Api-Key` header. This page explains how to create an API key and send it with a request.

## Before you start

- You need an AlsoAsked account.
- To use the live API, your account needs a Pro plan. The sandbox API doesn't need a Pro plan.

## Types of API key

AlsoAsked has 2 types of API key. The prefix of the API key shows its type.

| Type of API key | Prefix | Where the API key works |
| --- | --- | --- |
| Live API key | `aa-live-` | Only the live API, at `https://alsoaskedapi.com/v1.1` |
| Sandbox API key | `aa-sandbox-` | Only the sandbox API, at `https://sandbox.alsoaskedapi.com/v1.1` |

A live API key doesn't work on the sandbox API, and a sandbox API key doesn't work on the live API. If you send an API
key to the wrong API, the API rejects it as an invalid API key.

## Create an API key

To create an API key on the AlsoAsked website, do the following steps:

1. Sign in to AlsoAsked, and go to the **API keys** page at `https://alsoasked.com/developer/keys`.
2. Select **Create API key**.
3. In the **Name** field, enter a name for the API key. The name is for your reference only.
4. In the **Environment** field, choose **Live** or **Sandbox**.
5. Select **Create key**.
6. Copy the API key, and store it in a safe place. AlsoAsked shows the API key only once.

Each account can have a maximum of 10 API keys. Live API keys and sandbox API keys count together. Deleted API keys
don't count. An API key doesn't expire, and you can't rename it. The **API keys** page shows when each API key was last
used. You can create and delete API keys only on the AlsoAsked website, not through the API.

## Send an API key to the live API

To authenticate a request to the live API, put your live API key in the `X-Api-Key` header. A live API key starts with
`aa-live-`. You need an API key in every request to the live API.

The following request gets your account from the live API with the `GET /v1.1/account` endpoint. Replace
`YOUR_LIVE_API_KEY` with your live API key:

```bash
curl --request GET 'https://alsoaskedapi.com/v1.1/account' \
  --header 'X-Api-Key: YOUR_LIVE_API_KEY'
```

## Send an API key to the sandbox API

To authenticate a request to the sandbox API, put your sandbox API key in the `X-Api-Key` header. A sandbox API key
starts with `aa-sandbox-`. You need an API key in every request to the sandbox API.

The following request gets your account from the sandbox API with the `GET /v1.1/account` endpoint. Replace
`YOUR_SANDBOX_API_KEY` with your sandbox API key:

```bash
curl --request GET 'https://sandbox.alsoaskedapi.com/v1.1/account' \
  --header 'X-Api-Key: YOUR_SANDBOX_API_KEY'
```

## Result

If the API accepts the API key in the `X-Api-Key` header, the response to `GET /v1.1/account` contains the account
that owns the API key. For the fields in the response body, see [Account details](./account.md).

## If there is a problem

If the AlsoAsked API can't authenticate a request, the API returns an error response. The body of an error response
has 2 fields:

| Field | What the field contains |
| --- | --- |
| `status` | The error type, for example `missing_api_key`. Use the `status` field in your code. |
| `message` | Text for people. The text can change, so don't use the `message` field in your code. |

The following table shows the authentication errors:

| Problem | Cause | What to do |
| --- | --- | --- |
| Status code `401 Unauthorized`, error type `missing_api_key` | The request doesn't have the `X-Api-Key` header. | Add the `X-Api-Key` header with your API key to the request. |
| Status code `403 Forbidden`, error type `invalid_api_key` | The `X-Api-Key` header is empty. | Put your API key in the `X-Api-Key` header. Check that the variable that holds the API key in your code isn't empty. |
| Status code `403 Forbidden`, error type `invalid_api_key` | The value in the `X-Api-Key` header isn't a valid API key, or someone deleted the API key. | Check that you copied the full API key, or create a new API key. |
| Status code `403 Forbidden`, error type `invalid_api_key` | You sent a live API key to the sandbox API, or a sandbox API key to the live API. | Send a live API key, which starts with `aa-live-`, to the live API, and a sandbox API key, which starts with `aa-sandbox-`, to the sandbox API. |
| Status code `401 Unauthorized`, error type `api_access_disabled` | AlsoAsked turned off API access for your account. AlsoAsked checks this before it checks the plan. | Contact AlsoAsked support at `support@alsoasked.com`. |

For all error types, see [Errors](./errors.md).

## Keep your API key secret

An API key identifies your account, so anyone with your API key can send requests as your account. Keep each API key
secret:

- Don't put an API key in code that runs in a web browser or in a mobile app. The AlsoAsked API doesn't accept requests
  from web pages on other websites, so send requests from your server.
- Don't commit an API key to a code repository.
- If someone else gets your API key, delete the API key and create a new one.

## Related

- [Sandbox API](./sandbox.md)
- [Errors](./errors.md)
- [Account details](./account.md)
- [OpenAPI specification](../openapi/openapi.yaml)
