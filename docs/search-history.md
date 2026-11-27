---
title: Manage your search history
description: List the searches in your search history, get one search with its results, and delete a search with the AlsoAsked API.
type: task
---

# Manage your search history

Your search history is the list of searches that you can see with the AlsoAsked API. This page explains how to list
your searches, get one search, and delete a search. Use these tasks when you want to find an earlier search or get its
results again.

## Before you start

- You need an API key in the `X-Api-Key` header of each request: a live API key for the live API, or a sandbox API key
  for the sandbox API. For details, see [Authenticate requests](./authentication.md).
- To get the ID of a search, perform a search or list your searches. For details, see
  [Perform a search](./perform-a-search.md).

## List your searches

The `GET /v1.1/search` endpoint lists the searches in your search history, newest first. To list your searches, do the
following steps:

1. Choose the number of searches on each page with the `count` query parameter of the `GET /v1.1/search` endpoint. The
   value is `1` to `100`. The default value is `10`.
2. Choose the page with the `page` query parameter of the `GET /v1.1/search` endpoint. The minimum value is `1`. The
   default value is `1`.
3. Send the request.

   The following request gets the first page of your searches from the live API, with 4 searches on the page:

   ```bash
   curl --request GET 'https://alsoaskedapi.com/v1.1/search?page=1&count=4' \
     --header 'X-Api-Key: YOUR_LIVE_API_KEY'
   ```

The response body of the `GET /v1.1/search` endpoint has these fields:

| Name | Type | Description |
| --- | --- | --- |
| `results` | array | The searches on the page, newest first. |
| `total` | integer | The number of searches in your search history, including deleted searches. |
| `page` | integer | The page in the response. |

Each search in the `results` field has the fields of the search object, except the `queries` field. Each search in the
`results` field also has the `terms` field: an array of strings with the terms of the search. For a deleted search,
the `terms` field is `null`. The `results` field doesn't contain the results of the searches. To get the results of a
search, see [Get one search](#get-one-search).

The live API lists both the searches that you performed with the API and the searches that you performed on the
AlsoAsked website.

If the `page` query parameter is past the last page, the response has an empty `results` field and the real `total`
field. To get every page, increase the `page` query parameter until the `results` field is empty. New searches go to the
start of the list, so a search can move to the next page while you read the pages. To find one search, use its ID with
the `GET /v1.1/search/{searchId}` endpoint instead.

The following JSON is an example response body from the `GET /v1.1/search` endpoint. The first search in the
`results` field is a deleted search:

```json
{
  "results": [
    {
      "id": "5S8YdxC3vq9M5zF1Vb4Xh3zylpfZgIba",
      "language": null,
      "region": null,
      "latitude": null,
      "longitude": null,
      "status": null,
      "deleted": true,
      "depth": null,
      "cached": null,
      "created_at": "2023-01-10T15:00:00+00:00",
      "updated_at": "2023-01-10T15:05:00+00:00",
      "cached_at": null,
      "terms": null
    },
    {
      "id": "7T1aKjx9Vb8YX2tksUeQwTPn6N0ku2E6",
      "language": "en",
      "region": "gb",
      "latitude": null,
      "longitude": null,
      "status": "success",
      "deleted": false,
      "depth": 2,
      "cached": true,
      "created_at": "2023-01-05T10:30:00+00:00",
      "updated_at": "2023-01-05T10:32:00+00:00",
      "cached_at": "2023-01-04T03:48:00+00:00",
      "terms": ["What are the best pasta recipes?"]
    },
    {
      "id": "8A6Wp1vHt3E4q0F7c9Xs5n8oZu2Bm1dL",
      "language": "de",
      "region": "de",
      "latitude": 52.52,
      "longitude": 13.405,
      "status": "success",
      "deleted": false,
      "depth": 3,
      "cached": false,
      "created_at": "2023-01-03T18:45:00+00:00",
      "updated_at": "2023-01-03T18:50:00+00:00",
      "cached_at": null,
      "terms": [
        "Wie kann man Energie sparen?",
        "Was sind die besten Tipps zum Energiesparen?",
        "Wie senke ich meinen Energieverbrauch?"
      ]
    },
    {
      "id": "9J1VrsN0ku2E6xW8M5Xh3zylpfZgIcba",
      "language": "en",
      "region": "gb",
      "latitude": 51.5072,
      "longitude": -0.1276,
      "status": "success",
      "deleted": false,
      "depth": 3,
      "cached": true,
      "created_at": "2023-01-01T00:00:00+00:00",
      "updated_at": "2023-01-01T00:00:10+00:00",
      "cached_at": "2022-12-31T00:00:00+00:00",
      "terms": [
        "When to plant out broad beans?",
        "How to grow broad beans?",
        "When to harvest broad beans?"
      ]
    }
  ],
  "total": 32,
  "page": 1
}
```

## Get one search

The `GET /v1.1/search/{searchId}` endpoint gets one search from your search history, with its results. To get one
search, do the following steps:

1. Find the ID of the search. The ID is in the `id` field of the search, in the response of `POST /v1.1/search` or
   `GET /v1.1/search`.
2. Send a request to the `GET /v1.1/search/{searchId}` endpoint. Put the ID of the search in the `searchId` path
   parameter.

   The following request gets the search with the ID `9J1VrsN0ku2E6xW8M5Xh3zylpfZgIcba` from the live API:

   ```bash
   curl --request GET 'https://alsoaskedapi.com/v1.1/search/9J1VrsN0ku2E6xW8M5Xh3zylpfZgIcba' \
     --header 'X-Api-Key: YOUR_LIVE_API_KEY'
   ```

The response body of the `GET /v1.1/search/{searchId}` endpoint is the search object. The search object has the
`queries` field with the results, and it doesn't have the `terms` field. Each term is in the `term` field of a query in
the `queries` field. For all the fields of the search object, see [Search results](./search-results.md).

## Delete a search

The `DELETE /v1.1/search/{searchId}` endpoint deletes a search. Deleting a search removes its terms, its options, and
its results from the API. The search itself stays in your search history as a deleted search, with the `deleted` field
set to `true`. You can still list and get a deleted search, but you can't delete it again. To delete a search, do the
following steps:

1. Find the ID of the search. The ID is in the `id` field of the search, in the response of `POST /v1.1/search` or
   `GET /v1.1/search`.
2. Send a request to the `DELETE /v1.1/search/{searchId}` endpoint. Put the ID of the search in the `searchId` path
   parameter.

   The following request deletes the search with the ID `5S8YdxC3vq9M5zF1Vb4Xh3zylpfZgIba` from the live API:

   ```bash
   curl --request DELETE 'https://alsoaskedapi.com/v1.1/search/5S8YdxC3vq9M5zF1Vb4Xh3zylpfZgIba' \
     --header 'X-Api-Key: YOUR_LIVE_API_KEY'
   ```

If the API deletes the search, the API returns the status code `204 No Content` with no response body.

Deleting a search doesn't stop it. If the search is still running, its terms keep running. AlsoAsked refunds the
credits of the terms that fail or have no results, the same as for a search that you don't delete, and doesn't refund a
term that succeeds after you delete the search. The stored results of the terms that succeed stay, and AlsoAsked can
use them for later searches.

AlsoAsked creates no new webhook events for a deleted search, but a webhook event that AlsoAsked created before can
still arrive. See [Webhook event types](./webhooks.md#webhook-event-types).

A deleted search stays in the response of the `GET /v1.1/search` endpoint and of the `GET /v1.1/search/{searchId}`
endpoint. In a deleted search, the `deleted` field is `true`. These fields of a deleted search are `null`: `language`,
`region`, `latitude`, `longitude`, `status`, `depth`, `cached`, `cached_at`, and `queries`. The `id` and `created_at`
fields keep their values, and the `updated_at` field has the time when you deleted the search.

The following JSON is an example response body from `GET /v1.1/search/{searchId}` for a deleted search:

```json
{
  "id": "5S8YdxC3vq9M5zF1Vb4Xh3zylpfZgIba",
  "language": null,
  "region": null,
  "latitude": null,
  "longitude": null,
  "status": null,
  "deleted": true,
  "depth": null,
  "cached": null,
  "created_at": "2023-01-10T15:00:00+00:00",
  "updated_at": "2023-01-10T15:05:00+00:00",
  "cached_at": null,
  "queries": null
}
```

## Searches in your search history

The `GET /v1.1/search`, `GET /v1.1/search/{searchId}`, and `DELETE /v1.1/search/{searchId}` endpoints work only with
searches in your search history. Which searches are in your search history depends on the API and on your role:

- On the live API, the history limit of your plan sets how old a search in your search history can be. For a Pro plan,
  the history limit is 1 year.
- On the live API, in a team, the history limit of the team owner's plan applies. The team owner sees all the searches
  of the team. A team administrator, which is a team member with the administrator role, sees the searches of the team
  members, but not the searches of the team owner. Any other team member sees only the searches
  that the member performed.
- On the sandbox API, you see only your own searches on the sandbox API. The sandbox API has no time limit for the
  search history.

If a search isn't in your search history, the `GET /v1.1/search/{searchId}` and `DELETE /v1.1/search/{searchId}`
endpoints return the status code `404 Not Found` with the error type `not_found`. This happens for a search of another
account, a search older than the history limit of your plan, and a search that doesn't exist. A deleted search is still
in your search history, so the `GET /v1.1/search/{searchId}` endpoint returns it, but the
`DELETE /v1.1/search/{searchId}` endpoint returns `404 Not Found` for a search that's already deleted.

## Find a search after a lost response

If your request to `POST /v1.1/search` gets no response, for example because your client stopped waiting or the
connection closed, AlsoAsked may still have recorded the search, charged the credits, and started it. Before you
perform the search again, check your search history:

1. Send a request to `GET /v1.1/search?page=1&count=100`.
2. Look for a search with the same terms in the `terms` field, created at about the time of your request. The `terms`
   field has each unique term once, without the whitespace and the invisible characters at the start and at the end.
   See [Terms](./perform-a-search.md#terms).
3. If you find the search, use its `id` field with the `GET /v1.1/search/{searchId}` endpoint to get the results.

If you perform the search again instead, the result depends on the first search:

- A term that already ended with the status `success` in the first search uses its stored results, even if the first
  search is still running, so the term costs no credits, unless the `fresh` field is `true`.
- Every other term runs again and costs credits again: a term that's still running, and a term that ended with the
  status `no_results` or `error`.

## If there is a problem

If the AlsoAsked API can't complete a request for your search history, the API returns an error response. The `status`
field in the error response body has the error type.

| Problem | Cause | What to do |
| --- | --- | --- |
| Status code `422 Unprocessable Content`, error type `validation`, from `GET /v1.1/search` | The `page` query parameter is less than `1`, or the `count` query parameter isn't `1` to `100`. The `errors` field names the query parameter, for example `count`. | Set the `page` query parameter to `1` or more, and the `count` query parameter to `1` to `100`. |
| Status code `422 Unprocessable Content`, error type `validation`, from `GET /v1.1/search/{searchId}` or `DELETE /v1.1/search/{searchId}` | The `searchId` path parameter isn't 32 letters and digits. The `errors` field names `searchId`. | Check the ID of the search. |
| Status code `404 Not Found`, error type `not_found`, from `GET /v1.1/search/{searchId}` or `DELETE /v1.1/search/{searchId}` | The search isn't in your search history: it belongs to another account, is older than the history limit of your plan, or doesn't exist. Or you sent a `DELETE` request for a search that's already deleted. | Check the `searchId` path parameter. Use an API key of the account that performed the search. |

For all error types, see [Errors](./errors.md).

## Related

- [Perform a search](./perform-a-search.md)
- [Search results](./search-results.md)
- [Sandbox API](./sandbox.md)
- [Errors](./errors.md)
- [OpenAPI specification](../openapi/openapi.yaml)
