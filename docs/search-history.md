---
stoplight-id: gjsbz1kf26lkg
---

# Search history

The AlsoAsked API provides a search history endpoint that allows you to see the most recent searches made by your account, as well as remove any searches that you no longer want to see.

## Get search history

The [**`GET /v1/search`**](/docs/also-asked/dbb7cfb7f037d-list-searches) endpoint returns a paginated list of the most recent searches made by your account, with the most recent search first.

The endpoint accepts a `page` query parameter, which allows you to paginate through the results. The default number of results per page is 10, but you can change this by passing a `count` query parameter.

The response includes the page requested (the `page` property), the total number of searches (the `total` property), and the search requests themselves (the `results` property).

The search requests in the `results` property include the properties outlined in the [**`Paginated Search Results`**](/docs/also-asked/6934661b082ae-paginated-search-results) schema. These are the same properties that are returned when making a search request, minus the `results` property. Details of these properties can be found in the [**Searching -> Search request results**](/docs/also-asked/fdmxb8iq84kmn-performing-searches#search-request-results) documentation.

### Try it out

You can try out the `GET /v1/search` endpoint using the form below.

<!--
type: tab
title: Live
-->

```json http
{
  "method": "GET",
  "url": "https://alsoaskedapi.com/v1/search",
  "headers": {
    "Content-Type": "application/json",
    "X-Api-Key": "aa-live-"
  },
  "query": {
    "page": 1,
    "count": 10
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
  "url": "https://sandbox.alsoaskedapi.com/v1/search",
  "headers": {
    "Content-Type": "application/json",
    "X-Api-Key": "aa-sandbox-"
  },
  "query": {
    "page": 1,
    "count": 10
  }
}
```

<!-- type: tab-end -->

## Get a search request

The [**`GET /v1/search/{searchId}`**](/docs/also-asked/723bb74f8c8f3-get-search) endpoint returns a single search request by its ID.

You can use this endpoint to retrieve a search request that you have previously made, along with the results of that search request.

The response includes the properties outlined in the [**`Search Request Results`**](/docs/also-asked/f019600cf755a-search-request-results) schema. Details of these properties can be found in the [**Searching -> Search request results**](/docs/also-asked/fdmxb8iq84kmn-performing-searches#search-request-results) documentation.

### Try it out

You can try out the `GET /v1/search/{searchId}` endpoint using the form below.

<!--
type: tab
title: Live
-->

```json http
{
  "method": "GET",
  "url": "https://alsoaskedapi.com/v1/search/{searchId}",
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
  "url": "https://sandbox.alsoaskedapi.com/v1/search/{searchId}",
  "headers": {
    "Content-Type": "application/json",
    "X-Api-Key": "aa-sandbox-"
  }
}
```

<!-- type: tab-end -->

## Delete a search request

The [**`DELETE /v1/search/{searchId}`**](/docs/also-asked/d9ca28e424d9a-delete-search) endpoint deletes a single search request by its ID.

You can use this endpoint to delete a search request that you no longer want to see in your search history. The request will remain in the search history, but it's search request options and search results will be removed.

### Try it out

You can try out the `DELETE /v1/search/{searchId}` endpoint using the form below.


<!--
type: tab
title: Live
-->

```json http
{
  "method": "DELETE",
  "url": "https://alsoaskedapi.com/v1/search/{searchId}",
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
  "method": "DELETE",
  "url": "https://sandbox.alsoaskedapi.com/v1/search/{searchId}",
  "headers": {
    "Content-Type": "application/json",
    "X-Api-Key": "aa-sandbox-"
  }
}
```

<!-- type: tab-end -->
