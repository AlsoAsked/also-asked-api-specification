---
stoplight-id: fdmxb8iq84kmn
---

# Performing searches

Searching is the core feature of AlsoAsked, and the most important part of the AlsoAsked API. We allow searches to be performed in different ways, to suit different use cases.

## Search methods

The simplest way is to use the **synchronous** search method, which returns results immediately. This is the best option for simpler use cases. For more complex use cases, we also offer an **asynchronous** search method, which allows you to perform searches in the background, and retrieve the results later. This is controlled by the `async` property in the [**Search request options**](/docs/also-asked/28445a301eb8a-search-request-options) schema passed to the [**`POST /v1/search`**](/docs/also-asked/61f57d877f150-perform-search) endpoint.

### Comparing synchronous and asynchronous search

The **synchronous** search method is the simplest way to perform searches, and is the best option for simpler use cases. The **asynchronous** search method is more complex, but offers some benefits over the synchronous method around performance and reliability. There are benefits and drawbacks to both methods, and the best option will depend on your use case.

#### Synchronous uses, benefits, and drawbacks

It's best to use the synchronous search method for simpler use cases, where you don't need to perform a large number of searches, or where you don't need to perform searches in the background. The synchronous search method is the simplest way to perform searches, and is the best option for simpler use cases.

| **Benefits** | **Drawbacks** |
|---|---|
| A single HTTP request is all that's needed to perform the search and get the results. | The request will hang until the search is complete. |
| There's no need for webhooks or polling to see when a search status changes or to get the results. | The request will timeout if the search takes more than 90 seconds to complete. |
| | There's the rare potential for issues on the AlsoAsked side to cause the request to error. |

<!-- theme: info -->
> #### Synchronous search timeout
>
> The AlsoAsked API will timeout a synchronous search request if it takes more than 90 seconds to complete. If this happens, the API still return a **Search Request Results** containing the search ID and status, but the results will be empty. You can then use the search ID to retrieve the results later using the [**`GET /v1/search/{searchId}`**](/docs/also-asked/723bb74f8c8f3-get-search) endpoint.

#### Asynchronous uses, benefits, and drawbacks

It's best to use the asynchronous search method for more complex use cases, where you need to perform a large number of searches (bulk search), or where you need to perform searches in the background. The asynchronous search method is more complex, but offers some benefits over the synchronous method around performance and reliability.

| **Benefits** | **Drawbacks** |
|---|---|
| A fire-and-forget approach to performing searches. Send a single HTTP request to perform the search, and get immediately get an ID for the request for fetching results with later. | More complex to implement than the synchronous method. |
| There's no risk of timeout issues when sending a search request. | You need to use webhooks or polling to see when a search status changes or to get the results. |

## Search request options

The [**Search Request Options**](/docs/also-asked/28445a301eb8a-search-request-options) schema allows you to specify options for your search. These options are passed to the [**`POST /v1/search`**](/docs/also-asked/61f57d877f150-perform-search) endpoint in the JSON body, and are identical for both synchronous and asynchronous searches.

### Terms

The **`terms`** property allows you to specify the search terms you want to perform.

This is a **required** property, and must be an array of strings, even for a single term. You can specify up to 1000 terms per search.

### Language

The **`language`** property allows you to specify the language you want to perform the search in.

This is an **optional** `string` property. You can specify any language supported by AlsoAsked (see the [**Search Request Options**](/docs/also-asked/28445a301eb8a-search-request-options) schema), with the default being English (`en`).

### Region

The **`region`** property allows you to specify the region you want to perform the search in.

This is an **optional** `string` property. You can specify any region supported by AlsoAsked (see the [**Search Request Options**](/docs/also-asked/28445a301eb8a-search-request-options) schema), with the default being the USA (`us`).

### Depth

The **`depth`** property allows you to specify the depth of the results returned by the search.

This is an **optional** `integer` property. You can specify any depth of either `2` or `3`, with the default being `2`.

A search depth of `3` is equivalent of performing a deep search through the AlsoAsked website. The number of credits you'll be charged will depend on the depth of the search, and the number of terms you've specified.

| **Depth** | **Credit cost** |
|---|---|
| 2 | 1 |
| 3 | 4 |

### Fresh

The **`fresh`** property allows you to specify whether you want to perform a fresh search.

If you've previously searched for a term that you've included in this search request, and `fresh` is `false` (the default), then the search results will be fetched from that previously made search, and you won't be charged a credit.

If you've previously searched for a term that you've included in this search request, and `fresh` is `true`, then a new search will always be performed with the freshest results returned, and you will be charged a credit.

This is an **optional** `boolean` property. You can specify either `true` or `false`, with the default being `false` (meaning cached results will be returned if available).

### Async

The **`async`** property allows you to specify whether you want to perform an asynchronous search.

If `async` is `false` (the default), then the search will be performed synchronously, and the results will be returned immediately.

If `async` is `true`, then the search will be performed asynchronously, with the results either sent to you via [**webhooks**](/docs/also-asked/kyda8pzsv3vxv-webhooks), or fetched by you manually using the [**`GET /v1/search/{searchId}`**](/docs/also-asked/723bb74f8c8f3-get-search) endpoint.

This is an **optional** `boolean` property. You can specify either `true` or `false`, with the default being `false` (meaning the search will be performed synchronously).

### Notify Webhooks

The **`notify_webhooks`** property allows you to specify whether you want to be notified via [**webhooks**](/docs/also-asked/kyda8pzsv3vxv-webhooks) when the search status changes.

This is an **optional** `boolean` property. You can specify either `true` or `false`, with the default being `true` (meaning you will be notified via webhooks).

## Search request results

The [**Search Request Results**](/docs/also-asked/f019600cf755a-search-request-results) schema is returned by the [**`POST /v1/search`**](/docs/also-asked/61f57d877f150-perform-search) and [**`GET /v1/search/{searchId}`**](/docs/also-asked/723bb74f8c8f3-get-search) endpoints, as well being the request body sent to [**webhook endpoints**](/docs/also-asked/kyda8pzsv3vxv-webhooks).

### ID

The `id` property is a unique identifier for the search request. This will always be included in the response, and will be a `string` of 32 characters (a-z, A-Z, and 0-9).

You can use this ID to retrieve the results of the search later using the [**`GET /v1/search/{searchId}`**](/docs/also-asked/723bb74f8c8f3-get-search) endpoint.

### Language

The `language` property is the language that the search was performed in. This will always be included in the response, and will be a `string`.

### Region

The `region` property is the region that the search was performed in. This will always be included in the response, and will be a `string`.

### Status

The `status` property is the status of the search request. This will always be included in the response, and will be a `string`.

The status will be one of the following:

| **Status** | **Description** |
|---|---|
| `queueing` | The search request has been received, and is waiting to be queued for processing. |
| `pending` | The search request has been queued for processing, and is waiting to be processed. |
| `running` | The search request is being processed. |
| `fetching` | The search request has been processed, and the results are being fetched. |
| `error` | The search request has been processed, but an error occurred. A refund will be issued for the credit used. |
| `no_results` | The search request has been processed, but no results were found. A refund will be issued for the credit used. |
| `success` | The search request has been processed successfully, and the results are available. |

### Deleted

The `deleted` property indicates whether the search request has been deleted. This will always be included in the response, and will be a `boolean`.

### Depth

The `depth` property is the depth of the results returned by the search. This will always be included in the response, and will be an `integer`.

### Cached

The `cached` property indicates whether the results were returned from a cached search. This will always be included in the response, and will be a `boolean`.

### Created at

The `created_at` property is the date and time that the search request was created. This will always be included in the response, and will be a `string` in ISO 8601 format.

### Updated at

The `updated_at` property is the date and time that the search request was last updated. This will always be included in the response, and will be a `string` in ISO 8601 format.

### Cached at

The `cached_at` property is the date and time that the search request was last cached. This will be `null` unless the results were returned from a cached search, and will be a `string` in ISO 8601 format.

### Queries

The `queries` property is an array of objects for each of the search terms that were included in the search request. This will always be included in the response.

Each object in the array will contain the following properties:

#### Term

The `term` property is the search term that was included in the search request. This will be a `string`.

#### Language fallback

The `language_fallback` property indicates whether the results were returned for the language specified in the search request, or, if no results were returned for that language, the search term was searched for in the default language for the specified region. This will be a `boolean`.

For example, if you searched for the term `car` in Spanish (`es`) in the USA (`us`) but no results were found, the `language_fallback` property would be `true`, and the search term would be searched for in English in the USA.

#### Region fallback

The `region_fallback` property indicates whether the results were returned for the region specified in the search request, or, if no results were returned for that region, the search term was searched for in the default region for the specified language. This will be a `boolean`.

For example, if you searched for the term `car` in Spanish (`es`) in the USA (`us`) but no results were found, the `region_fallback` property would be `true`, and the search term would be searched for in Spanish in Spain.

#### Results

The `results` property is an array of objects for each of the results returned for the search term. This will be an empty array if no results were returned for the search term.

Each result itself will also contain an array `results` with the same properties, allowing you to traverse the results tree.

Each object in the array will contain the following properties:

##### Question

The `question` property is the question that was returned for the search term. This will be a `string`.

For example, if you searched for the term `car` in English in the USA, the `question` property might be `What is the most popular car?`.

##### Answer excerpt

The `answer_excerpt` property is an excerpt of the answer that was returned for the search term. This will be a `string`.

For example, if you searched for the term `car` in English in the USA, the `answer_excerpt` property might be `The most popular car in the USA is the Ford F-150.`.

##### Answer href

The `answer_href` property is the URL of the page that the answer was returned from. This will be a `string`.

For example, if you searched for the term `car` in English in the USA, the `answer_href` property might be `https://www.cars.com/most-popular-car`.

##### Answer page title

The `answer_page_title` property is the title of the page that the answer was returned from. This will be a `string`.

For example, if you searched for the term `car` in English in the USA, the `answer_page_title` property might be `Most popular car in the USA`.

##### Results

The `results` property is an array of objects for each of the results returned for the search term. This will be an empty array if no results were returned for the search term, or the `depth` specified in the search request has been reached.

Each object in the array will contain the same properties as the top-level `results` array, allowing you to traverse the results tree.
