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
- Test the whole flow on the sandbox API first. See [Test the flow on the sandbox
  API](#test-the-flow-on-the-sandbox-api).

## Steps

1. **Clean the list of terms.** Remove terms that are the same, and remove blank terms. Terms are case-sensitive, so
   `Coffee` and `coffee` are 2 terms that each cost credits. One term that isn't valid makes the API reject the whole
   search, so check each term before you send it: 1 to 4,127 characters, and some text other than whitespace, double
   quotes, and invisible characters, such as a zero-width space. Remove the whitespace and the invisible characters at
   the start and at the end of each term too: AlsoAsked does this, and the `term` field of each query has the term
   without them. See [Terms](./perform-a-search.md#terms).
2. **Split the list into searches of up to 1,000 terms.** One `POST /v1.1/search` request can have 1 to 1,000 terms.
   Don't send each term as its own search: at the rate limit of 200 requests in 5 minutes, 5,000 searches with 1 term
   each take more than 2 hours to send. See [Rate limits](./rate-limits.md).

   Choose the size of each search from the size of the results that your code can receive. The results of a search
   with 1,000 terms are about 45 MB at a depth of `2`, both in the body of the webhook event and in the response body
   of the `GET /v1.1/search/{searchId}` endpoint. If your server can't accept a request body of that size, use fewer
   terms in each search, for example 100 terms, which is about 4.5 MB.
3. **Check your credits.** Send a request to the `GET /v1.1/account` endpoint. AlsoAsked pays for each term with one
   kind of credit, plan credits first, so a few plan credits can be left that can't pay for a whole term. Make sure that
   the `credits` field is at least the cost of the search plus the cost of one term. Terms with stored results cost
   nothing and don't count. If your account doesn't have enough credits for the whole search, the API rejects the
   search with `402 Payment Required` and the error type `insufficient_credits`, and searches for none of its terms.
   See [Plan credits and pay-as-you-go credits](./credits.md#plan-credits-and-pay-as-you-go-credits).
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

   The response body is the search object, usually with a status that isn't complete and `null` in the `queries`
   field. For an example, see
   [What an asynchronous search returns](./searches.md#what-an-asynchronous-search-returns).

5. **Save the ID of each search immediately.** Store the `id` field of the response with the terms of the search, before
   you send the next request. If a request gets no response, don't send it again until you check your search history.
   See [Find a search after a lost response](./search-history.md#find-a-search-after-a-lost-response).
6. **Wait for each search to complete.** A search is complete when its `status` field is `success`, `no_results`, or
   `error`. A search typically completes in seconds. In the worst case, a term that isn't complete 15 minutes after you
   perform the search fails with the status `error`. If many terms fail with the status `error`, perform smaller
   searches. See [How long a search can take](./how-a-search-runs.md#how-long-a-search-can-take).

   Use one of these ways to know when a search is complete:
   - **Webhook events (recommended):** your webhook endpoint receives the `search_succeeded` or the `search_failed`
     webhook event. The `queries` field of the body has the status of each term, and the results of the terms that
     succeeded. Then you don't need to send requests to check the search.
   - **Repeated requests:** send a request to the `GET /v1.1/search/{searchId}` endpoint for each search that isn't
     complete, for example every 60 seconds. Stop when the search is complete.
7. **Read the result of each term.** When the search is complete, the `queries` field has one query for each unique
   term. Read the `status` field of each query:
   - `success`: the `results` field has the results.
   - `no_results`: the term has no results on Google. AlsoAsked refunded the credits of the term.
   - `error`: the term failed. AlsoAsked refunded the credits of the term. To try the term again, put it in a later
     search. Some terms fail every time, so try each term again only a few times, for example 2 times.

## Handle the webhook events of a large search

A search with many terms sends the same few webhook events as a search with 1 term: one `search_created`, one
`search_started`, and one `search_succeeded` or `search_failed` for the whole search, not one for each term. So 5,000
terms in 5 searches send about 15 webhook events to each webhook endpoint. The webhook events aren't many, but the body
of the last one is large. Make your webhook endpoint handle them safely:

- Verify the signature of each webhook event. See [Verify webhook signatures](./verify-webhook-signatures.md).
- Accept large request bodies. The body of the `search_succeeded` webhook event has the results of every term: about
  45 KB for each term at a depth of `2`, so about 45 MB for a search with 1,000 terms, and more at a depth of `3`. A
  webhook endpoint that rejects a large body never receives that webhook event. Check the limit of your web server,
  your framework, and any proxy in front of them. See [Webhook request](./webhooks.md#webhook-request).
- Return a `2xx` status code quickly, and process the body after you respond. AlsoAsked waits a maximum of 30 seconds.
- Ignore a webhook event whose `event_id` field you already processed.
- Use the `status` field of the body, not the order of arrival. Webhook events can arrive out of order.
- Keep repeated requests as a backup. If every attempt to send a webhook event fails, AlsoAsked doesn't send it again.
  Check any search that isn't complete after its deadline with the `GET /v1.1/search/{searchId}` endpoint.

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
| Status code `402 Payment Required`, error type `insufficient_credits` | Your account doesn't have enough credits for the whole search. | Wait for your plan credits to renew, buy pay-as-you-go credits, or perform a smaller search. AlsoAsked searched for none of the terms. |
| Status code `422 Unprocessable Content`, error type `validation` | A term or a field isn't valid. The `errors` field names it, for example `terms.37`. | Correct or remove the term, then send the whole search again. AlsoAsked searched for none of the terms. |
| Status code `429 Too Many Requests` | You sent more requests than the rate limit allows. | Wait until the time in the `Retry-After` header, then send the request again. |
| Status code `500 Internal Server Error`, error type `internal_server` | An error happened in AlsoAsked. | Send the request again. AlsoAsked refunded the credits of every term that wasn't complete. See [Internal server errors](./errors.md#internal-server-errors). |
| Status code `500 Internal Server Error` without an error type, or no response | An unexpected error in AlsoAsked or the network. | Check your search history before you send the request again. See [Find a search after a lost response](./search-history.md#find-a-search-after-a-lost-response). |
| A search isn't complete after its deadline | A webhook event failed, or your code missed it. | Send a request to `GET /v1.1/search/{searchId}`. Every term is complete by its deadline, or fails with the status `error`. |

## Related

- [Synchronous and asynchronous searches](./searches.md)
- [Webhooks](./webhooks.md)
- [Manage your search history](./search-history.md)
- [Credits](./credits.md)
- [Rate limits](./rate-limits.md)
- [OpenAPI specification](../openapi/openapi.yaml)
