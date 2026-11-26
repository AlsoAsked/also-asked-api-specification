---
title: Search many terms
description: Perform searches for hundreds or thousands of terms reliably, and collect the result of every term.
type: task
---

# Search many terms

This page explains how to search a large list of terms with the AlsoAsked API, for example 5,000 terms, and how to
collect the result of every term without losing searches or paying twice. Read it before you build an integration
that runs without a person watching it.

## Before you start

- You need a live API key and a Pro plan. See [Authenticate requests](./authentication.md).
- You need enough credits for all the terms. See [Credits](./credits.md).
- You need a webhook endpoint that receives the `search_succeeded` and `search_failed` webhook events, or a plan to
  check each search with `GET /v1.1/search/{searchId}`. See [Webhooks](./webhooks.md).
- Test the whole flow on the sandbox API first. See [Test the flow on the sandbox API](#test-the-flow-on-the-sandbox-api).

## Steps

1. **Clean the list of terms.** Remove terms that are the same, and remove blank terms. Terms are case-sensitive, so
   `Coffee` and `coffee` are two terms that each cost credits. One term that isn't valid makes the API reject the whole
   search, so check each term before you send it: 1 to 4,127 characters, and some text other than spaces and double
   quotes.
2. **Split the list into searches of up to 1,000 terms.** One `POST /v1.1/search` request can have 1 to 1,000 terms.
   Don't send each term as its own search: 5,000 searches with 1 term each need 5,000 requests, which is more than the
   rate limit allows. See [Rate limits](./rate-limits.md).
3. **Check your credits.** Send a request to `GET /v1.1/account`, and compare the `credits` field with the cost of the
   next search. If your account doesn't have enough credits for the whole search, the API rejects the search with
   `402 Payment Required` and the error type `insufficient_credits`, and performs none of its terms.
4. **Perform each search as an asynchronous search.** Set the `async` field to `true` and the `notify_webhooks` field
   to `true`. Leave the `fresh` field as `false`, so that terms with stored results cost no credits.

   ```bash
   curl --request POST 'https://alsoaskedapi.com/v1.1/search' \
     --header 'Content-Type: application/json' \
     --header 'X-Api-Key: YOUR_LIVE_API_KEY' \
     --data '{
       "terms": ["how to brew coffee", "how to brew tea", "how to grind coffee beans"],
       "language": "en",
       "region": "us",
       "depth": 2,
       "fresh": false,
       "async": true,
       "notify_webhooks": true
     }'
   ```

5. **Save the ID of each search at once.** Store the `id` field of the response with the terms of the search, before
   you send the next request. If a request gets no response, don't send it again until you check your search history.
   See [Find a search after a lost response](./search-history.md#find-a-search-after-a-lost-response).
6. **Wait for each search to complete.** A search is complete when its `status` field is `success`, `no_results`, or
   `error`. With more than 1 term, a search can take up to 30 minutes at a depth of 1 or 2, and up to 60 minutes at a
   depth of 3. Use one of these ways to know when a search is complete:
   - **Webhook events (recommended):** your webhook endpoint receives `search_succeeded` or `search_failed`. The body
     has the results. Then you don't need to send requests to check the search.
   - **Polling:** send a request to `GET /v1.1/search/{searchId}` for each search that isn't complete, for example every
     60 seconds. Stop when the search is complete.
7. **Read the result of each term.** When the search is complete, the `queries` field has one query for each term. Read
   the `status` field of each query:
   - `success`: the `results` field has the results.
   - `no_results`: the term has no results on Google. AlsoAsked refunded the credits of the term.
   - `error`: the term failed. AlsoAsked refunded the credits of the term. To try the term again, put it in a later
     search.

## Handle webhook events at volume

When you search many terms, your webhook endpoint receives many webhook events. Make your webhook endpoint handle them
safely:

- Verify the signature of each webhook event. See [Verify webhook signatures](./verify-webhook-signatures.md).
- Return a `2xx` status code quickly, and process the body after you respond. AlsoAsked waits a maximum of 30 seconds.
- Ignore a webhook event whose `event_id` field you already processed.
- Use the `status` field of the body, not the order of arrival. Webhook events can arrive out of order.
- Keep polling as a backup. If every attempt to send a webhook event fails, AlsoAsked doesn't send it again. Check any
  search that isn't complete after its deadline with `GET /v1.1/search/{searchId}`.

## Test the flow on the sandbox API

The sandbox API has test terms that make a term or a request behave in a known way. Use them to test each case of your
integration before you use credits. Send the same requests to `https://sandbox.alsoaskedapi.com/v1.1` with a sandbox API
key:

| Case to test | Test term |
| --- | --- |
| A term that fails | `[error]` |
| A term with no results | `[no_results]` |
| A search that isn't complete when a synchronous search returns | `[timeout]` |
| A `429 Too Many Requests` response | `[rate_limit]` |
| A `500 Internal Server Error` response | `[server_error]` |

For details, see [Sandbox API](./sandbox.md).

## If there is a problem

| Problem | Cause | What to do |
| --- | --- | --- |
| Status code `402 Payment Required`, error type `insufficient_credits` | Your account doesn't have enough credits for the whole search. | Wait for your credits to reset, buy API credits, or perform a smaller search. AlsoAsked performed none of the terms. |
| Status code `422 Unprocessable Content`, error type `validation` | A term or a field isn't valid. The `errors` field names it, for example `terms.37`. | Correct or remove the term, then send the whole search again. AlsoAsked performed none of the terms. |
| Status code `429 Too Many Requests` | You sent more requests than the rate limit allows. | Wait until the time in the `Retry-After` header, then send the request again. |
| Status code `500 Internal Server Error`, or no response | An error in AlsoAsked or the network. | Check your search history before you send the request again. See [Find a search after a lost response](./search-history.md#find-a-search-after-a-lost-response). |
| A search isn't complete after its deadline | A webhook event failed, or your code missed it. | Send a request to `GET /v1.1/search/{searchId}`. Every term is complete by its deadline, or fails with the status `error`. |

## Related

- [Synchronous and asynchronous searches](./searches.md)
- [Webhooks](./webhooks.md)
- [Search history](./search-history.md)
- [Credits](./credits.md)
- [Rate limits](./rate-limits.md)
- [OpenAPI specification](../openapi/openapi.yaml)
