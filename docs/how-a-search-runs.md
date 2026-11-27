---
title: How a search runs
description: Learn how AlsoAsked runs the terms of a search, when it uses stored results, how the status of a search comes from its terms, and how long a search can take.
type: concept
---

# How a search runs

After you perform a search, AlsoAsked runs each term of the search separately. This page explains when a term uses
stored results, how the status of a search comes from the statuses of its terms, and how long a search can take. The
rules are the same for a synchronous search and an asynchronous search.

## Searches with stored results

AlsoAsked stores the results of each term that ends with the status `success`. If any account searched for the same term
before, with the same language code, region code, depth, and location (the `latitude` and `longitude` fields), AlsoAsked
can use the stored results instead of getting new results from Google. A term that uses stored results costs no credits,
however old the stored results are. The term must match exactly, including uppercase and lowercase letters. AlsoAsked
doesn't use stored results if a top-level result has a blank answer excerpt. The sandbox API has no stored results.

To always get new results from Google, set the `fresh` field to `true`. Then every term costs credits.

If every term in your search has stored results, the search is complete as soon as you perform it. The API returns the
results immediately in a synchronous search and in an asynchronous search, and the `async` field makes no difference.
The `cached` field of the search is `true` if at least one term used stored results.

## Status of a search with more than one term

Each term in a search has its own status, and the status of the search comes from the statuses of its terms:

- While at least 1 term isn't complete, the search isn't complete, and it has the status of a term that isn't
  complete: `running` if a term has that status, otherwise `fetching`, otherwise `pending`, otherwise `queueing`.
- When every term is complete, the status of the search is `success` if at least 1 term has the status `success`.
- If no term has the status `success`, the status of the search is `no_results` if at least 1 term has the status
  `no_results`.
- If every term has the status `error`, the status of the search is `error`.

For what each status means, see [Search status](./search-results.md#search-status).

So a search with the status `success` doesn't always mean that every term succeeded: if one term has the status
`success` and another term has the status `error`, the status of the search is `success`. When the search is complete,
each query in the `queries` field has its own `status` field: `success`, `no_results`, or `error`. AlsoAsked refunds
the credits of each term with the status `no_results` or `error`.

The status of a term doesn't change after it's `success`, `no_results`, or `error`.

If AlsoAsked can't search for a term, for example because of the text of the term, the term fails immediately with the
status `error`, and AlsoAsked refunds its credits. The same term fails again if you send it again, so limit how many
times your code tries a term again.

## How long a search can take

A search typically completes in 15 to 30 seconds. To see the latest search times, go to the
[AlsoAsked status page](https://alsoaskedstatus.com/).

In the worst case, a term takes 15 minutes. Each term has a deadline of 15 minutes from when you perform the search,
in a search of any size. The deadline includes the time that the term waits for its turn. A term that isn't complete by
its deadline fails with the status `error`, and AlsoAsked refunds its credits. If many terms of a large search fail
with the status `error`, perform smaller searches.

## Related

- [Synchronous and asynchronous searches](./searches.md)
- [Perform a search](./perform-a-search.md)
- [Search results](./search-results.md)
- [Credits](./credits.md)
- [Search many terms](./bulk-searches.md)
- [OpenAPI specification](../openapi/openapi.yaml)
