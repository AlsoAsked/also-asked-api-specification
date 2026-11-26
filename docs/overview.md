---
title: AlsoAsked API overview
description: Learn what the AlsoAsked API does, what you need to use it, and where to start.
type: concept
---

# AlsoAsked API overview

The AlsoAsked API gets the "People Also Ask" questions that Google shows for a term. You send one or more terms, and
the API returns the questions, their answers, and their child results. This page explains what
the AlsoAsked API returns, what you can do with it, and what you need to start.

## What the AlsoAsked API returns

You send a search to the AlsoAsked API. A search is a set of 1 or more terms. A term is a question or phrase that
AlsoAsked searches for, for example `how to brew coffee`.

For each term, the AlsoAsked API returns results. A result is one question that Google shows for the term. Each result
has an answer. Some answers are AI overviews, which are answers that Google generates from more than one web page.

A result can have child results. A child result is a result inside another result. The `depth` field of a search sets
how many levels of results the search gets. The value of the `depth` field is 1, 2, or 3.

## What you can do with the AlsoAsked API

The AlsoAsked API has 5 endpoints. With the AlsoAsked API, you can do these tasks:

| Task | Endpoint |
| --- | --- |
| Perform a synchronous search or an asynchronous search. | `POST /v1.1/search` |
| Get the status and the results of a search. | `GET /v1.1/search/{searchId}` |
| List your previous searches. | `GET /v1.1/search` |
| Delete a search. | `DELETE /v1.1/search/{searchId}` |
| Get your account details and your credits. | `GET /v1.1/account` |

AlsoAsked can also send webhook events to your webhook endpoints when the status of a search changes. For details, see
[Webhooks](./webhooks.md).

## Live API and sandbox API

The AlsoAsked API has two environments: the live API and the sandbox API. Both environments have the same endpoints.

- **Live API**: gets real results from Google and uses the credits of your plan. The base URL is
  `https://alsoaskedapi.com/v1.1`. To use the live API, your account needs a Pro plan. To compare plans, go to
  [AlsoAsked pricing](https://alsoasked.com/pricing).
- **Sandbox API**: returns test results and uses separate sandbox credits, not the credits of your plan. The base URL
  is `https://sandbox.alsoaskedapi.com/v1.1`. Any account can use the sandbox API. You don't need a Pro plan.

Each environment has its own API keys. A live API key starts with `aa-live-` and works only on the live API. A sandbox
API key starts with `aa-sandbox-` and works only on the sandbox API. For details, see
[Authenticate requests](./authentication.md).

## When to use the live API or the sandbox API

| | Live API | Sandbox API |
| --- | --- | --- |
| Base URL | `https://alsoaskedapi.com/v1.1` | `https://sandbox.alsoaskedapi.com/v1.1` |
| Plan that you need | Pro plan | Any plan |
| Results | Real results from Google | Test results |
| Credits | The credits of your plan | Separate sandbox credits |
| API key prefix | `aa-live-` | `aa-sandbox-` |

Use the sandbox API while you develop and test your integration. Use the live API when you need real results from
Google. For details, see [Sandbox API](./sandbox.md).

## API versions

The AlsoAsked API has two versions: `v1` and `v1.1`. Both versions have the same 5 endpoints. The AlsoAsked API
documentation describes version `v1.1`. The version is part of the base URL, for example
`https://alsoaskedapi.com/v1.1`.

## Next steps

- [Quickstart](./quickstart.md): perform your first search.
- [Authenticate requests](./authentication.md): create an API key and send it with each request.
- [Sandbox API](./sandbox.md): test your integration without a Pro plan.
- [Synchronous and asynchronous searches](./searches.md): choose how the API returns the results of a search.
- [Perform a search](./perform-a-search.md): send a search to the AlsoAsked API.
- [Webhooks](./webhooks.md): receive webhook events when the status of a search changes.
- [Errors](./errors.md): understand the error responses of the AlsoAsked API.
- [Glossary](./glossary.md): find the meaning of each term in the AlsoAsked API documentation.
- [OpenAPI specification](../openapi/openapi.yaml): see every endpoint, field, and response.

## Get help with the AlsoAsked API

If you have a question about the AlsoAsked API, email AlsoAsked support at
[help@alsoasked.com](mailto:help@alsoasked.com).
