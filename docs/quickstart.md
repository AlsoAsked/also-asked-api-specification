---
title: Quickstart
description: Create a sandbox API key, perform your first search on the sandbox API, read the results, and get the search again.
type: quickstart
---

# Quickstart

In this quickstart, you perform your first search on the AlsoAsked sandbox API, read the results, and get the search
again by its ID. The quickstart takes about 5 minutes. Any AlsoAsked account can use the sandbox API, so you don't need
a Pro plan, and the search doesn't use the credits of your plan.

## Before you start

- You need an AlsoAsked account. Any plan works for the sandbox API.
- You need a terminal with the `curl` command-line tool, to send the requests in this quickstart.

The sandbox API returns test results, not real results from Google. A search on the sandbox API uses sandbox credits,
which are separate from the credits of your plan. For details, see [Sandbox API](./sandbox.md).

## 1. Create a sandbox API key

The sandbox API accepts only a sandbox API key. A sandbox API key starts with `aa-sandbox-`. To create a sandbox API key
on the AlsoAsked website, do the following steps:

1. Sign in to AlsoAsked, and go to the [**API keys** page](https://alsoasked.com/developer/keys).
2. Select **Create API key**.
3. In the **Name** field, enter a name for the API key. The name is for your reference only.
4. In the **Environment** field, choose **Sandbox**.
5. Select **Create key**.
6. Copy the API key, and store it in a safe place. AlsoAsked shows the API key only once.

Keep your sandbox API key secret. Don't put an API key in code that runs in a web browser or in a mobile app, and don't
commit an API key to a code repository. For details, see [Authenticate requests](./authentication.md).

## 2. Perform a synchronous search on the sandbox API

To perform a search, send a `POST` request to `https://sandbox.alsoaskedapi.com/v1.1/search`. Put your
sandbox API key in the `X-Api-Key` header, and put the terms in the `terms` field of the JSON request body.

1. Copy the following request. The request performs a synchronous search on the sandbox API for 1 term,
   `how to brew coffee`, in English, for the United States, with a depth of `2`:

   ```bash
   curl --request POST 'https://sandbox.alsoaskedapi.com/v1.1/search' \
     --header 'Content-Type: application/json' \
     --header 'X-Api-Key: YOUR_SANDBOX_API_KEY' \
     --data '{
       "terms": ["how to brew coffee"],
       "language": "en",
       "region": "us",
       "depth": 2
     }'
   ```

2. Replace `YOUR_SANDBOX_API_KEY` with your sandbox API key, which starts with `aa-sandbox-`.
3. Run the request in your terminal.

The fields in the `POST /v1.1/search` request body do these things:

- The `terms` field contains the terms to search for. A search has 1 to 1,000 terms.
- The `language` field contains the language code of the search. The default language code is `en`.
- The `region` field contains the region code of the search. The default region code is `us`.
- The `depth` field sets the number of levels of results: `1`, `2`, or `3`. The default depth is `2`.

The request body has no `async` field. The default value of the `async` field is `false`, so the search is a
synchronous search. In a synchronous search, the API waits until the search is complete before it returns the
response. On the sandbox API, a synchronous search is complete after 3 to 9 seconds. On the live API, the API waits a
maximum of 90 seconds.

This search has 1 term and a depth of `2`, so the search costs 1 sandbox credit. For details, see
[Credits](./credits.md).

## 3. Read the results of the search

If the AlsoAsked API accepts the search, the API returns the status code `200 OK`. The response body contains the
search. These are the important fields of the search in the `POST /v1.1/search` response body:

- The `id` field contains the ID of the search: 32 letters and digits. Use the ID to get the search again.
- The `status` field contains the status of the search. A search is complete when its status is `success`,
  `no_results`, or `error`.
- The `queries` field contains one query for each unique term in the search. The `queries` field is `null` until the
  search is complete.

Each query in the `queries` field has these fields:

- The `term` field contains the term of the query.
- The `status` field contains the status of the term: `success`, `no_results`, or `error`.
- The `results` field contains the top-level results for the term, if the status of the term is `success`.

Each result in the `results` field of a query has these fields:

- The `question` field contains the question that Google shows for the term.
- The `answer_excerpt` field contains an excerpt of the answer.
- The `position` field contains the place of the result, as an array of numbers. A top-level result has 1 number, for
  example `[1]`. A child result has 1 number for each level, for example `[1, 2]` for the second child result of the
  first top-level result.
- The `results` field contains the child results of the result. A child result has the same fields as a top-level
  result.

The following JSON is an example response body for a search with 1 term and a depth of `2`. The example is
shortened to 1 top-level result and 1 child result, and its questions and answers are example text in English. Your
response from the sandbox API has the same fields, but it has 4 top-level results, each with 6 to 10 child results, and
the questions and the answers are placeholder text in Latin. On the live API, the results are the questions and the
answers that Google shows.

```json
{
  "id": "gzu106FjVblnPu99fbVOgUgCoBO6Pesm",
  "language": "en",
  "region": "us",
  "latitude": null,
  "longitude": null,
  "status": "success",
  "deleted": false,
  "depth": 2,
  "cached": false,
  "created_at": "2026-01-31T12:00:00+00:00",
  "updated_at": "2026-01-31T12:00:06+00:00",
  "cached_at": null,
  "queries": [
    {
      "term": "how to brew coffee",
      "status": "success",
      "language_fallback": false,
      "region_fallback": false,
      "results": [
        {
          "question": "How do you brew coffee at home?",
          "position": [1],
          "answer_excerpt": "Example answer excerpt for the first top-level result.",
          "answer_href": "https://example.com/brew-coffee-at-home",
          "answer_page_title": "Example page title",
          "ai_overview": false,
          "ai_overview_hrefs": null,
          "ai_overview_page_titles": null,
          "results": [
            {
              "question": "How much coffee do you use for one cup?",
              "position": [1, 1],
              "answer_excerpt": "Example answer excerpt for the first child result.",
              "answer_href": "https://example.com/coffee-for-one-cup",
              "answer_page_title": "Example page title",
              "ai_overview": false,
              "ai_overview_hrefs": null,
              "ai_overview_page_titles": null,
              "results": []
            }
          ]
        }
      ]
    }
  ]
}
```

If the search isn't complete, the `queries` field is `null`. To get the results later, send a `GET` request to
`https://sandbox.alsoaskedapi.com/v1.1/search/{searchId}` with the `id` field. See
[Get the search again](#4-get-the-search-again).

For all the fields of the search, the query, and the result, see [Search results](./search-results.md).

## 4. Get the search again

To get the search again, send a `GET` request to `https://sandbox.alsoaskedapi.com/v1.1/search/{searchId}`.
Use the `id` field from the `POST /v1.1/search` response body as the `searchId` path parameter.

1. Copy the following request:

   ```bash
   curl --request GET 'https://sandbox.alsoaskedapi.com/v1.1/search/YOUR_SEARCH_ID' \
     --header 'X-Api-Key: YOUR_SANDBOX_API_KEY'
   ```

2. Replace `YOUR_SEARCH_ID` with the `id` field from the `POST /v1.1/search` response body.
3. Replace `YOUR_SANDBOX_API_KEY` with your sandbox API key.
4. Run the request in your terminal.

The `GET /v1.1/search/{searchId}` endpoint returns the same search object as the `POST /v1.1/search` endpoint, with
the same fields. If the search wasn't complete before, read the `status` field again. When the status is `success`,
`no_results`, or `error`, the search is complete, and the `queries` field contains the queries.

## Next steps

- **Move to the live API.** The live API gets real results from Google and uses the credits of your plan. To use the
  live API, your account needs a Pro plan and a live API key, which starts with `aa-live-`. The base URL of the live
  API is `https://alsoaskedapi.com/v1.1`. To move your integration, change the base URL and the API key. See
  [AlsoAsked API overview](./overview.md) and [Authenticate requests](./authentication.md).
- **Perform an asynchronous search.** Set the `async` field to `true` to get the response immediately, before the
  search is complete. See [Synchronous and asynchronous searches](./searches.md).
- **Choose more fields for a search.** Set a more exact location, get fresh results, or perform a search with more
  terms. See [Perform a search](./perform-a-search.md).
- **Receive webhook events.** AlsoAsked can send webhook events to your webhook endpoints when the status of a search
  changes. See [Webhooks](./webhooks.md).
- **Handle errors.** Learn the error types that the AlsoAsked API returns and what to do for each error type. See
  [Errors](./errors.md).
- **Test more cases on the sandbox API.** Add a test term such as `[error]` or `[no_results]` to the `terms` field, so
  that a term fails or has no results. See [Sandbox API](./sandbox.md).
- **Search many terms.** Learn how to search thousands of terms and collect every result. See
  [Search many terms](./bulk-searches.md).
