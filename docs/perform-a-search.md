---
title: Perform a search
description: Perform a search with the POST /v1.1/search endpoint, and choose the terms, location, depth, and mode of the search.
type: task
---

# Perform a search

To get results from the AlsoAsked API, you perform a search with the `POST /v1.1/search` endpoint. This page explains
how to send the request, what each field in the request body does, and what the response contains.

## Before you start

- You need an API key. See [Authenticate requests](./authentication.md).
- To use the live API, your account needs a Pro plan. If your account doesn't have a Pro plan, use the sandbox API. See
  [Sandbox API](./sandbox.md).
- On the live API, a search costs credits. Your account needs enough credits for the search. See [Credits](./credits.md).

## Steps

To perform a search on the live API, do the following steps:

1. Choose the terms that you want results for. A search has 1 to 1,000 terms.
2. Send a request to `POST https://alsoaskedapi.com/v1.1/search`. Put your API key in the `X-Api-Key` header, and put
   the terms in the `terms` field of the JSON request body.

   The following request performs a synchronous search for 3 terms, in English, for a location in the United Kingdom.
   Replace `YOUR_LIVE_API_KEY` with your live API key:

   ```bash
   curl --request POST 'https://alsoaskedapi.com/v1.1/search' \
     --header 'Content-Type: application/json' \
     --header 'X-Api-Key: YOUR_LIVE_API_KEY' \
     --data '{
       "terms": [
         "When to plant out broad beans?",
         "How to grow broad beans?",
         "When to harvest broad beans?"
       ],
       "language": "en",
       "region": "gb",
       "latitude": 51.5072,
       "longitude": -0.1276,
       "depth": 2,
       "fresh": false,
       "async": false,
       "notify_webhooks": true
     }'
   ```

3. Read the response body. If the `status` field of the search is `success`, the `queries` field contains the results.
   If the search isn't complete, get the search later with `GET /v1.1/search/{searchId}` and the `id` field from the
   response.

## Request body fields

The request body of `POST /v1.1/search` is a JSON object. You must include the `terms` field. The other fields are optional.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `terms` | array of strings | None (required) | The terms to search for. 1 to 1,000 terms. Each term has 1 to 4,127 characters. See [Terms](#terms). |
| `language` | string | `en` | The language code of the search. The values are in the `Language` enum in the [OpenAPI specification](../openapi/openapi.yaml). |
| `region` | string | `us` | The two-letter International Organization for Standardization (ISO) 3166-1 region code of the search. The values are in the `Region` enum in the [OpenAPI specification](../openapi/openapi.yaml). |
| `latitude` | number | None | The latitude of a more exact location, from -90 to 90. Send the `latitude` field together with the `longitude` field. See [Location](#location). |
| `longitude` | number | None | The longitude of a more exact location, from -180 to 180. Send the `longitude` field together with the `latitude` field. See [Location](#location). |
| `depth` | integer | `2` | The number of levels of results: `1`, `2`, or `3`. The cost of the search depends on the depth. See [Depth and cost](#depth-and-cost). |
| `fresh` | boolean | `false` | If `true`, AlsoAsked gets new results from Google instead of cached results. See [Fresh results](#fresh-results). |
| `async` | boolean | `false` | If `false`, the search is a synchronous search. If `true`, the search is an asynchronous search. See [Synchronous and asynchronous searches](#synchronous-and-asynchronous-searches). |
| `notify_webhooks` | boolean | `true` | If `true`, AlsoAsked sends webhook events for the search. See [Webhook events](#webhook-events). |

The AlsoAsked API checks the request body against the OpenAPI specification. If a field has a value that isn't allowed,
for example a language code that isn't in the `Language` enum, the API returns `422 Unprocessable Content` with the
error type `validation`. The `message` field of the error body names the field.

## Terms

The `terms` field in the `POST /v1.1/search` request body is an array of strings. The array has 1 to 1,000 terms, and
each term has 1 to 4,127 characters.

Each term in the `terms` field must be different. If two terms are exactly the same, the API returns the status code
`422 Unprocessable Content` with the message `terms: all array items must be unique.`

AlsoAsked removes the spaces at the start and at the end of each term. If two terms are the same only after AlsoAsked
removes the spaces, AlsoAsked searches the term once and charges for the term once. For example, `how to brew coffee`
and ` how to brew coffee ` count as one term.

A term must contain text other than spaces and quotes. If a term contains only spaces, quotes, or invisible characters,
the API returns `422 Unprocessable Content` with the error type `validation`, and AlsoAsked charges no credits. The
`message` field of the error body gives the index of the term, from 0. For example, the message for the first term is
`terms -> 0: must contain text other than spaces and quotes.`

## Location

The `language` field and the `region` field in the `POST /v1.1/search` request body set the language and the country of
the search. The default language code is `en`, and the default region code is `us`.

For a more exact location, add the `latitude` field and the `longitude` field to the request body:

- The `latitude` field is a number from -90 to 90.
- The `longitude` field is a number from -180 to 180.
- Send both fields or neither field. If the request body has only one of the two fields, the API returns
  `422 Unprocessable Content` with the error type `validation` and the message
  `latitude and longitude must be provided together.`
- The value `0` is a real coordinate. A value of `0` doesn't mean that the search has no location.
- AlsoAsked rounds the `latitude` field and the `longitude` field to 7 decimal places.

## Depth and cost

The `depth` field in the `POST /v1.1/search` request body sets the number of levels of results: `1`, `2`, or `3`. The
default depth is `2`.

The cost of a search is the number of unique terms multiplied by the cost for the depth. On the live API with a Pro
plan, the cost for each term is as follows:

| Depth | Cost for each term |
| --- | --- |
| `1` | 1 credit |
| `2` | 1 credit |
| `3` | 4 credits |

For example, a search with 3 unique terms and a depth of `3` costs 12 credits. Depth `1` is available only through the
API. For details, see [Credits](./credits.md).

## Fresh results

The `fresh` field in the `POST /v1.1/search` request body controls cached results. The default value is `false`, so
AlsoAsked can use cached results for the search. Set the `fresh` field to `true` to get new results from Google instead
of cached results.

On the live API, a term with cached results costs nothing when `fresh` is `false`. When `fresh` is `true`, every term
costs credits. For details, see [Credits](./credits.md).

## Synchronous and asynchronous searches

The `async` field in the `POST /v1.1/search` request body sets the mode of the search. The default value is `false`.

- If the `async` field is `false`, the search is a synchronous search. The API waits until the search is complete, or
  until the timeout, before it returns the response. The default timeout is 90 seconds. <!-- PENDING C2: confirm production value -->
- If the `async` field is `true`, the search is an asynchronous search. The API returns the response immediately,
  without waiting for the search to finish.

For details, see [Synchronous and asynchronous searches](./searches.md).

## Webhook events

The `notify_webhooks` field in the `POST /v1.1/search` request body controls webhook events for the search. The default
value is `true`. AlsoAsked sends webhook events for synchronous searches and asynchronous searches, if the
`notify_webhooks` field is `true`. If you don't want webhook events for a search, set the `notify_webhooks` field to
`false`. On the live API, AlsoAsked sends webhook events only if your account has a Pro plan. For details, see
[Webhooks](./webhooks.md).

## Result

If the AlsoAsked API accepts the search, the API returns the status code `200 OK`. The response body contains the
search, with the same fields as the `GET /v1.1/search/{searchId}` response. The `id` field contains the ID of the
search, and the `status` field contains the status of the search.

The `queries` field is `null` unless the status of the search is `success`. When the status is `success`, the `queries`
field contains one query for each term, with the results for that term. For all fields in the response body, see
[Search results](./search-results.md).

To get the search later, send a request to `GET /v1.1/search/{searchId}` with the `id` field from the response. See
[Search history](./search-history.md).

## If there is a problem

If the AlsoAsked API can't perform the search, the API returns an error response. The `status` field of the error body
contains the error type.

| Problem | Cause | What to do |
| --- | --- | --- |
| Status code `400 Bad Request`, error type `invalid_body` | The request body isn't valid JSON. | Send a request body that's valid JSON. A body that's valid JSON but has the wrong fields or types gets the error type `validation` instead. |
| Status code `401 Unauthorized` | The request doesn't have the `X-Api-Key` header, or AlsoAsked turned off API access for your account. | Put your API key in the `X-Api-Key` header. See [Authenticate requests](./authentication.md). |
| Status code `402 Payment Required`, error type `insufficient_plan` | You sent the request to the live API, and your account doesn't have a Pro plan. | Change your plan to Pro, or use the sandbox API. See [Sandbox API](./sandbox.md). |
| Status code `402 Payment Required`, error type `insufficient_credits` | Your account doesn't have enough credits for the search. | Check the credits in your account, or perform the search with fewer terms or a lower depth. See [Credits](./credits.md). |
| Status code `403 Forbidden` | The value of the `X-Api-Key` header isn't a valid API key, or the API key is for the other API. | Check the API key. See [Authenticate requests](./authentication.md). |
| Status code `422 Unprocessable Content`, error type `validation`, message `terms: all array items must be unique.` | Two terms in the `terms` field are exactly the same. | Remove the repeated term. AlsoAsked charges no credits for the request. |
| Status code `422 Unprocessable Content`, error type `validation`, message `terms -> N: must contain text other than spaces and quotes.` | The term at index `N` (from 0) contains only spaces, quotes, or invisible characters. | Remove the term or add text to the term. AlsoAsked charges no credits for the request. |
| Status code `422 Unprocessable Content`, error type `validation`, message `latitude and longitude must be provided together.` | The request body has the `latitude` field or the `longitude` field, but not both. | Send both fields, or remove both fields. |
| Status code `422 Unprocessable Content`, error type `validation`, other message | A field has a value that the OpenAPI specification doesn't allow, for example a language code that isn't in the `Language` enum. | Correct the field that the `message` field names. |
| Status code `429 Too Many Requests` | You sent more requests than the rate limit allows. | Wait, then send the request again. See [Errors](./errors.md). |

For all error types, see [Errors](./errors.md).

## Related

- [Synchronous and asynchronous searches](./searches.md)
- [Search results](./search-results.md)
- [Search history](./search-history.md)
- [Credits](./credits.md)
- [Webhooks](./webhooks.md)
- [Errors](./errors.md)
- [OpenAPI specification](../openapi/openapi.yaml)
