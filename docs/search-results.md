---
title: Search results
description: Find the fields of the search object, its queries, and its results, and learn how to get the results as a tree or as a flat list.
type: reference
---

# Search results

The `POST /v1.1/search` endpoint and the `GET /v1.1/search/{searchId}` endpoint return a search object. This page lists
the fields of the search object, of each query, and of each result. It also explains the `position` field and the
`results_format` query parameter.

## Structure of a search

The search object that the `POST /v1.1/search` endpoint and the `GET /v1.1/search/{searchId}` endpoint return has 4
levels:

1. **Search**: the search object has an ID, a status, the options of the search, and the `queries` field.
2. **Queries**: the `queries` field has one query for each term in the search. The `term` field of each query has the
   term.
3. **Results**: the `results` field of each query has the top-level results for the term.
4. **Child results**: the `results` field of each result has its child results. A child result can have child results
   too.

The search object has no `terms` field. To find the terms of a search, read the `term` field of each query in the
`queries` field.

## Search fields

The response body of the `POST /v1.1/search` endpoint and the `GET /v1.1/search/{searchId}` endpoint is a search object
with these fields:

| Name | Type | Description |
| --- | --- | --- |
| `id` | string | The ID of the search: 32 letters and digits. Use the ID in the `GET /v1.1/search/{searchId}` endpoint. |
| `language` | string or `null` | The language code of the search, for example `en`. |
| `region` | string or `null` | The region code of the search, for example `us`. |
| `latitude` | number or `null` | The latitude of the search. |
| `longitude` | number or `null` | The longitude of the search. |
| `status` | string or `null` | The status of the search. For the values, see [Search status](#search-status). |
| `deleted` | boolean | `true` if the search is deleted, otherwise `false`. |
| `depth` | integer or `null` | The depth of the search: `1`, `2`, or `3`. |
| `cached` | boolean or `null` | `true` if at least one term of the search used results that AlsoAsked stored for an earlier search, instead of new results from Google. On the sandbox API, the value is `false`. |
| `created_at` | string | The date and time when AlsoAsked created the search, in ISO 8601 format. |
| `updated_at` | string | The date and time when the search last changed, in ISO 8601 format. |
| `cached_at` | string or `null` | The date and time when AlsoAsked stored the oldest of the earlier results that the search used, in ISO 8601 format. The value is `null` if no term used stored results, or on the sandbox API. |
| `queries` | array or `null` | One query for each term in the search. The value is `null` unless the status of the search is `success`. For the fields, see [Query fields](#query-fields). |

A search that gets new results from Google has `cached` set to `false` and `cached_at` set to `null`, even after
AlsoAsked stores its results for later searches. To get new results instead of stored results, set the `fresh` field to
`true` when you perform the search.

## Search status

The `status` field of the search object has one of these values: `queueing`, `pending`, `running`, `fetching`, `error`,
`no_results`, or `success`. For a deleted search, the `status` field is `null`. A search is complete when its status is `success`, `no_results`, or `error`.

The `queries` field of the search object is `null` unless the status is `success`. When the status is `success`, the
`queries` field has one query for each term in the search. A `null` value in the `queries` field doesn't always mean
that the search has no results. The search may not be complete yet. To check, read the `status` field. For details, see
[Synchronous and asynchronous searches](./searches.md).

## Fields of a deleted search

If a search is deleted, the `deleted` field of the search object is `true`. These fields of a deleted search object are
`null`:

- `language`
- `region`
- `latitude`
- `longitude`
- `status`
- `depth`
- `cached`
- `cached_at`
- `queries`

The `id` field, the `created_at` field, and the `updated_at` field of a deleted search object keep their values. For
details, see [Search history](./search-history.md).

## Query fields

Each query in the `queries` field of the search object has these fields:

| Name | Type | Description |
| --- | --- | --- |
| `term` | string | The term of the query. |
| `language_fallback` | boolean or `null` | `true` if AlsoAsked found no results in the language of the search, and searched in the default language of the region instead. |
| `region_fallback` | boolean or `null` | `true` if AlsoAsked found no results in the region of the search, and searched in the default region of the language instead. |
| `results` | array or `null` | The results for the term. For the fields, see [Result fields](#result-fields). |

If AlsoAsked has no results for the term of a query, the `language_fallback` field, the `region_fallback` field, and the
`results` field of the query are `null`.

## Result fields

Each result in the `results` field of a query in the search object has these fields. A child result has the same
fields.

| Name | Type | Description |
| --- | --- | --- |
| `question` | string | The question that Google shows for the term. |
| `position` | array of integers | The place of the result in the results for the term. For details, see [Position of a result](#position-of-a-result). |
| `answer_excerpt` | string | An excerpt of the answer. |
| `answer_href` | string | The URL of the page with the answer. |
| `answer_page_title` | string | The title of the page with the answer. |
| `ai_overview` | boolean | `true` if the answer is an AI overview, otherwise `false`. |
| `ai_overview_hrefs` | array of strings or `null` | The URLs of the sources of the AI overview. The value is `null` if the answer isn't an AI overview. |
| `ai_overview_page_titles` | array of strings or `null` | The page titles of the sources of the AI overview. |
| `results` | array | The child results of the result. A result has the `results` field only in the `tree` results format. For details, see [Results formats](#results-formats). |

## Position of a result

The `position` field of a result is an array of numbers. Each number starts at 1. The numbers are the path from the
top-level results to the result:

- A top-level result has 1 number in the `position` field. For example, `[3]` is the third top-level result.
- A child result has 1 number for each level. For example, `[3, 1]` is the first child result of the third top-level
  result.

The following results for the term `When to plant out broad beans?` show the value of the `position` field for each
result:

| `position` field | `question` field |
| --- | --- |
| `[1]` | `When to plant out broad beans?` |
| `[1, 1]` | `When can I transplant broad beans?` |
| `[1, 2]` | `Do broad beans need to be dried before planting?` |

The `position` field has the same value in the `tree` results format and the `flat` results format.

## Results formats

The `results_format` query parameter sets how the `GET /v1.1/search/{searchId}` endpoint lists the results of each
query. Only the `GET /v1.1/search/{searchId}` endpoint has the `results_format` query parameter.

| Value | Description |
| --- | --- |
| `tree` (default) | Each child result is in the `results` field of its parent result. The `results` field of a query has only the top-level results. |
| `flat` | The `results` field of a query has all the results for the term in one list, in depth-first order: each result comes before its child results. The results have no `results` field. |

The `position` field of a result has the same value in both results formats. In the `flat` results format, use the
`position` field to find the parent result of a child result.

The following request gets a search in the `flat` results format:

```bash
curl --request GET 'https://alsoaskedapi.com/v1.1/search/9J1VrsN0ku2E6xW8M5Xh3zylpfZgIcba?results_format=flat' \
  --header 'X-Api-Key: YOUR_API_KEY'
```

The following JSON shows the `queries` field of the response body in the `flat` results format. The example is
shortened from the example in the OpenAPI specification: it has fewer results and fewer AI overview sources.

```json
{
  "queries": [
    {
      "term": "When to plant out broad beans?",
      "status": "success",
      "language_fallback": false,
      "region_fallback": false,
      "results": [
        {
          "question": "When to plant out broad beans?",
          "position": [1],
          "answer_excerpt": "Broad beans can be planted out from mid-April to mid-May. If you are growing them in a greenhouse, you can plant them out from mid-March.",
          "answer_href": "https://www.gardenersworld.com/how-to/grow/broad-beans/when-to-plant-out-broad-beans/",
          "answer_page_title": "When to plant out broad beans? | Broad beans | Grow | Gardeners' World Magazine",
          "ai_overview": true,
          "ai_overview_hrefs": [
            "https://www.gardenersworld.com/how-to/grow/broad-beans/when-to-plant-out-broad-beans/",
            "https://www.gardenwiseinstitute.org/resources/beans/when-to-plant-fava-beans"
          ],
          "ai_overview_page_titles": [
            "When to plant out broad beans? | Broad beans | Grow | Gardeners' World Magazine",
            "When to plant out fava beans - Gardenwise Institute"
          ]
        },
        {
          "question": "When can I transplant broad beans?",
          "position": [1, 1],
          "answer_excerpt": "Broad beans prefer to be planted in the position where they are to grow, but can be planted in individual pots during the autumn and transplanted in to the ground in the spring.",
          "answer_href": "https://www.rhs.org.uk/education-learning/gardening-children-schools/family-activities/grow-it/grow/broad-beans",
          "answer_page_title": "Grow broad beans with children / RHS Gardening",
          "ai_overview": true,
          "ai_overview_hrefs": [
            "https://www.rhs.org.uk/education-learning/gardening-children-schools/family-activities/grow-it/grow/runner-beans",
            "https://www.rhs.org.uk/education-learning/gardening-children-schools/family-activities/grow-it/grow/carrots"
          ],
          "ai_overview_page_titles": [
            "Grow runner beans with children / RHS Gardening",
            "Sow and tend carrots with kids / RHS Gardening"
          ]
        },
        {
          "question": "Do broad beans need to be dried before planting?",
          "position": [1, 2],
          "answer_excerpt": "Next to potatoes, broad beans are one of the easiest staples to grow. Dried broad beans, or fava beans, are simply beans left in the pod until they rattle. When you've had your fill of fresh, leave the rest on the plant to dry. If it's wet, haul the pods indoors, to shell and dry somewhere warm.",
          "answer_href": "https://www.gardeningknowhow.com/edible/vegetables/broad-bean/drying-broad-beans.htm",
          "answer_page_title": "Drying Broad Beans - Gardening Know How",
          "ai_overview": true,
          "ai_overview_hrefs": [
            "https://www.gardeningknowhow.com/edible/vegetables/broad-bean/drying-broad-beans.htm",
            "https://www.gardenwiseinstitute.org/resources/beans/drying-fava-beans"
          ],
          "ai_overview_page_titles": [
            "Drying runner beans - Gardening Know How",
            "Drying fava beans - Gardenwise Institute"
          ]
        }
      ]
    }
  ]
}
```

## Example

The following request gets a search in the default `tree` results format:

```bash
curl --request GET 'https://alsoaskedapi.com/v1.1/search/9J1VrsN0ku2E6xW8M5Xh3zylpfZgIcba' \
  --header 'X-Api-Key: YOUR_API_KEY'
```

The following JSON is an example response body from the `GET /v1.1/search/{searchId}` endpoint. The search has 1 term
and a depth of 2. The example is shortened from the example in the OpenAPI specification: it has fewer results and
fewer AI overview sources.

```json
{
  "id": "9J1VrsN0ku2E6xW8M5Xh3zylpfZgIcba",
  "language": "en",
  "region": "us",
  "latitude": 51.5072,
  "longitude": 0.1276,
  "status": "success",
  "deleted": false,
  "depth": 2,
  "cached": true,
  "created_at": "2023-01-01T00:00:00+00:00",
  "updated_at": "2023-01-01T00:00:10+00:00",
  "cached_at": "2022-12-31T00:00:00+00:00",
  "queries": [
    {
      "term": "When to plant out broad beans?",
      "status": "success",
      "language_fallback": false,
      "region_fallback": false,
      "results": [
        {
          "question": "When to plant out broad beans?",
          "position": [1],
          "answer_excerpt": "Broad beans can be planted out from mid-April to mid-May. If you are growing them in a greenhouse, you can plant them out from mid-March.",
          "answer_href": "https://www.gardenersworld.com/how-to/grow/broad-beans/when-to-plant-out-broad-beans/",
          "answer_page_title": "When to plant out broad beans? | Broad beans | Grow | Gardeners' World Magazine",
          "ai_overview": true,
          "ai_overview_hrefs": [
            "https://www.gardenersworld.com/how-to/grow/broad-beans/when-to-plant-out-broad-beans/",
            "https://www.gardenwiseinstitute.org/resources/beans/when-to-plant-fava-beans"
          ],
          "ai_overview_page_titles": [
            "When to plant out broad beans? | Broad beans | Grow | Gardeners' World Magazine",
            "When to plant out fava beans - Gardenwise Institute"
          ],
          "results": [
            {
              "question": "When can I transplant broad beans?",
              "position": [1, 1],
              "answer_excerpt": "Broad beans prefer to be planted in the position where they are to grow, but can be planted in individual pots during the autumn and transplanted in to the ground in the spring.",
              "answer_href": "https://www.rhs.org.uk/education-learning/gardening-children-schools/family-activities/grow-it/grow/broad-beans",
              "answer_page_title": "Grow broad beans with children / RHS Gardening",
              "ai_overview": true,
              "ai_overview_hrefs": [
                "https://www.rhs.org.uk/education-learning/gardening-children-schools/family-activities/grow-it/grow/runner-beans",
                "https://www.rhs.org.uk/education-learning/gardening-children-schools/family-activities/grow-it/grow/carrots"
              ],
              "ai_overview_page_titles": [
                "Grow runner beans with children / RHS Gardening",
                "Sow and tend carrots with kids / RHS Gardening"
              ],
              "results": []
            },
            {
              "question": "Do broad beans need to be dried before planting?",
              "position": [1, 2],
              "answer_excerpt": "Next to potatoes, broad beans are one of the easiest staples to grow. Dried broad beans, or fava beans, are simply beans left in the pod until they rattle. When you've had your fill of fresh, leave the rest on the plant to dry. If it's wet, haul the pods indoors, to shell and dry somewhere warm.",
              "answer_href": "https://www.gardeningknowhow.com/edible/vegetables/broad-bean/drying-broad-beans.htm",
              "answer_page_title": "Drying Broad Beans - Gardening Know How",
              "ai_overview": true,
              "ai_overview_hrefs": [
                "https://www.gardeningknowhow.com/edible/vegetables/broad-bean/drying-broad-beans.htm",
                "https://www.gardenwiseinstitute.org/resources/beans/drying-fava-beans"
              ],
              "ai_overview_page_titles": [
                "Drying runner beans - Gardening Know How",
                "Drying fava beans - Gardenwise Institute"
              ],
              "results": []
            }
          ]
        }
      ]
    }
  ]
}
```

## Related

- [Perform a search](./perform-a-search.md)
- [Synchronous and asynchronous searches](./searches.md)
- [Search history](./search-history.md)
- [Glossary](./glossary.md)
- [OpenAPI specification](../openapi/openapi.yaml)
