---
title: AlsoAsked API overview
description: Learn what the AlsoAsked API does, what you need to use it, and where to start.
type: concept
---

# AlsoAsked API overview

The AlsoAsked API gets the "People Also Ask" questions that Google shows for a term: the box of related questions on
a Google results page. You send one or more terms, and the API returns the questions, their answers, and their child
results. This page explains what the AlsoAsked API returns, what you can do with it, and what you need to start.

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

The AlsoAsked API has 2 environments: the live API and the sandbox API. Both environments have the same endpoints, and
each environment has its own API keys.

| | Live API | Sandbox API |
| --- | --- | --- |
| Base URL | `https://alsoaskedapi.com/v1.1` | `https://sandbox.alsoaskedapi.com/v1.1` |
| Plan that you need | Pro plan | Any plan |
| Results | Real results from Google | Test results |
| Credits | The credits of your plan | Separate sandbox credits |
| API key prefix | `aa-live-` | `aa-sandbox-` |

Use the sandbox API while you develop and test your integration. Use the live API when you need real results from
Google. A live API key works only on the live API, and a sandbox API key works only on the sandbox API. To compare
plans, go to [AlsoAsked pricing](https://alsoasked.com/pricing). For details, see [Sandbox API](./sandbox.md) and
[Authenticate requests](./authentication.md).

## API versions

The AlsoAsked API has 2 versions: `v1` and `v1.1`. Both versions have the same 5 endpoints. The AlsoAsked API
documentation describes version `v1.1`. The version is part of the base URL, for example
`https://alsoaskedapi.com/v1.1`.

Use version `v1.1` for a new integration. Version `v1` differs from version `v1.1` in these ways:

- The default value of the `depth` field is `3`, not `2`.
- A query has no `status` field, and the `queries` field is `null` unless the status of the search is `success`.
- A result has no `position` field, and child results also appear at the top level of the `results` field.
- The `GET /v1/search/{searchId}` endpoint ignores the `results_format` query parameter.
- A `422 Unprocessable Content` validation error has no `errors` field.
- The body of a webhook event has no `event_id` field.

## Next steps

- [Quickstart](./quickstart.md): perform your first search.
- [Authenticate requests](./authentication.md): create an API key and send it with each request.
- [Sandbox API](./sandbox.md): test your integration without a Pro plan.
- [Synchronous and asynchronous searches](./searches.md): choose how the API returns the results of a search.
- [How a search runs](./how-a-search-runs.md): learn about stored results, statuses, and deadlines.
- [Perform a search](./perform-a-search.md): send a search to the AlsoAsked API.
- [Search results](./search-results.md): find every field of a search and its results.
- [Manage your search history](./search-history.md): list, get, and delete searches.
- [Search many terms](./bulk-searches.md): search hundreds or thousands of terms reliably.
- [Credits](./credits.md): learn what a search costs and when AlsoAsked refunds credits.
- [Account details](./account.md): get your account and your credits.
- [Rate limits](./rate-limits.md): find how many requests you can send.
- [Webhooks](./webhooks.md): receive webhook events when the status of a search changes.
- [Verify webhook signatures](./verify-webhook-signatures.md): check that AlsoAsked sent a webhook event.
- [Errors](./errors.md): understand the error responses of the AlsoAsked API.
- [Glossary](./glossary.md): find the meaning of each term in the AlsoAsked API documentation.
- [Changelog](./changelog.md): find the changes to the AlsoAsked API.
- [OpenAPI specification](../openapi/openapi.yaml): see every endpoint, field, and response.

## Get help with the AlsoAsked API

If you have a question about the AlsoAsked API, email AlsoAsked support at
[support@alsoasked.com](mailto:support@alsoasked.com).
