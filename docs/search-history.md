---
title: Search history
description: List the searches in your search history, get one search with its results, and delete a search with the AlsoAsked API.
type: task
---

# Search history

Your search history is the list of searches that you can see with the AlsoAsked API. This page explains how to list
your searches, get one search, and delete a search. Use these tasks when you want to find an earlier search or get its
results again.

## Before you start

- You need a live API key in the `X-Api-Key` header of each request. For details, see
  [Authenticate requests](./authentication.md).
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

   The following request gets the first page of your searches from the live API, with 2 searches on the page:

   ```bash
   curl --request GET 'https://alsoaskedapi.com/v1.1/search?page=1&count=2' \
     --header 'X-Api-Key: YOUR_API_KEY'
   ```

The response body of the `GET /v1.1/search` endpoint has these fields:

| Name | Type | Description |
| --- | --- | --- |
| `total` | integer | The number of searches in your search history. |
| `page` | integer | The page in the response. |
| `results` | array | The searches on the page, newest first. |

Each search in the `results` field has the fields of the search object, except the `queries` field. Each search in the
`results` field also has the `terms` field: an array of strings with the terms of the search. For a deleted search,
the `terms` field is `null`. The `results` field doesn't contain the results of the searches. To get the results of a
search, see [Get one search](#get-one-search).

The following JSON is an example response body from the `GET /v1.1/search` endpoint. The first search in the
`results` field is a deleted search:

```json
{
  "total": 32,
  "page": 1,
  "results": [
    {
      "id": "5S8YdxC3vq9M5zF1Vb4Xh3zylpfZgIba",
      "terms": null,
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
      "cached_at": null
    },
    {
      "id": "7T1aKjx9Vb8YX2tksUeQwTPn6N0ku2E6",
      "terms": ["What are the best pasta recipes?"],
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
      "cached_at": "2023-01-04T03:48:00+00:00"
    }
  ]
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
     --header 'X-Api-Key: YOUR_API_KEY'
   ```

The response body of the `GET /v1.1/search/{searchId}` endpoint is the search object. The search object has the
`queries` field with the results, and it doesn't have the `terms` field. Each term is in the `term` field of a query in
the `queries` field. For all the fields of the search object, see [Search results](./search-results.md).

## Delete a search

The `DELETE /v1.1/search/{searchId}` endpoint deletes a search from your search history. To delete a search, do the
following steps:

1. Find the ID of the search. The ID is in the `id` field of the search, in the response of `POST /v1.1/search` or
   `GET /v1.1/search`.
2. Send a request to the `DELETE /v1.1/search/{searchId}` endpoint. Put the ID of the search in the `searchId` path
   parameter.

   The following request deletes the search with the ID `5S8YdxC3vq9M5zF1Vb4Xh3zylpfZgIba` from the live API:

   ```bash
   curl --request DELETE 'https://alsoaskedapi.com/v1.1/search/5S8YdxC3vq9M5zF1Vb4Xh3zylpfZgIba' \
     --header 'X-Api-Key: YOUR_API_KEY'
   ```

If the API deletes the search, the API returns the status code `204 No Content` with no response body.

A deleted search stays in the response of `GET /v1.1/search` and in the response of `GET /v1.1/search/{searchId}`.
In a deleted search, the `deleted` field is `true`. These fields of a deleted search are `null`: `language`, `region`,
`latitude`, `longitude`, `status`, `depth`, `cached`, `cached_at`, and `queries`. The `id`, `created_at`, and
`updated_at` fields keep their values.

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
- On the live API, in a team, the search history is the search history of the team owner, so the history limit of the
  team owner's plan applies. The team owner sees all the searches of the team. A team administrator sees the searches of the
  team members, but not the searches of the team owner. A team member sees only the searches that the member performed.
- On the sandbox API, you see only your own sandbox searches. The sandbox API has no time limit for the search history.
  For details, see [Sandbox API](./sandbox.md).

If a search isn't in your search history, the `GET /v1.1/search/{searchId}` and `DELETE /v1.1/search/{searchId}`
endpoints return the status code `404 Not Found` with the error type `not_found`. This happens for a search of another
account, a search older than the history limit of your plan, and a search that doesn't exist. The
`DELETE /v1.1/search/{searchId}` endpoint also returns `404 Not Found` for a search that's already deleted.

## If there is a problem

If the AlsoAsked API can't complete a request for your search history, the API returns an error response. The `status`
field in the error response body has the error type.

| Problem | Cause | What to do |
| --- | --- | --- |
| Status code `422 Unprocessable Content`, error type `validation`, from `GET /v1.1/search` | The `page` query parameter is less than `1`, or the `count` query parameter isn't `1` to `100`. For example, the `message` field is `Value "101" for argument "count" is invalid for Request [get /search].` | Set the `page` query parameter to `1` or more, and the `count` query parameter to `1` to `100`. |
| Status code `404 Not Found`, error type `not_found`, from `GET /v1.1/search/{searchId}` or `DELETE /v1.1/search/{searchId}` | The search isn't in your search history. The search belongs to another account, is older than the history limit of your plan, or doesn't exist. | Check the `searchId` path parameter. Use an API key of the account that performed the search. |

For all error types, see [Errors](./errors.md).

## Related

- [Perform a search](./perform-a-search.md)
- [Search results](./search-results.md)
- [Sandbox API](./sandbox.md)
- [Errors](./errors.md)
- [OpenAPI specification](../openapi/openapi.yaml)
