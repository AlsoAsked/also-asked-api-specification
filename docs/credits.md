---
title: Credits
description: Learn how AlsoAsked charges credits for searches, how to calculate the cost of a search, and how to check the credits in your account.
type: concept
---

# Credits

AlsoAsked uses credits to charge for searches. Each search costs credits for each term, and the cost depends on the
depth of the search. Read this page to know what a search costs, when AlsoAsked charges and refunds credits, and how to
check the credits in your account.

## Plan credits and pay-as-you-go credits

An AlsoAsked account has 2 kinds of credits:

- **Plan credits** come with your plan, and renew each month. When your plan credits renew, AlsoAsked sets them to the
  full amount of your plan, so plan credits that you didn't use don't carry over. The `credits_reset_at` field in the
  `GET /v1.1/account` response body shows when your plan credits renew next.
- **Pay-as-you-go credits** are credits that you buy. Pay-as-you-go credits don't expire and don't renew. You can use
  them only while your account has a Pro plan.

Both kinds of credits pay for searches on the AlsoAsked API and on the AlsoAsked website. AlsoAsked uses your plan
credits first, and charges each term to one kind of credit only. If the plan credits that remain are fewer than the cost
of a term, AlsoAsked charges that term and every later term of the search to your pay-as-you-go credits, and the
remaining plan credits stay in your account.

Because one kind of credit pays for each term, a search can fail with `insufficient_credits` even if the total of your
credits is enough. For example, with 3 plan credits and 3 pay-as-you-go credits, a term at a depth of `3`, which costs 4
credits, gets `402 Payment Required`: neither kind of credit has 4 credits.

For plans and prices, see the [AlsoAsked pricing page](https://alsoasked.com/pricing).

## Cost of a search

On the live API, the cost for each term depends on the depth of the search:

| Depth | Cost for each term |
| --- | --- |
| `1` | 1 credit |
| `2` | 1 credit |
| `3` | 4 credits |

A depth of `1` is available on the live API, the sandbox API, and the AlsoAsked Model Context Protocol (MCP) server,
but not on the AlsoAsked website. If you don't set the `depth` field in the `POST /v1.1/search` request body, the
depth is `2`.

On the live API, the cost of a search is the number of unique terms without stored results, multiplied by the cost for
each term at the depth of the search:

```text
cost of a search = number of unique terms without stored results × cost for each term at the depth
```

For example, a search with 3 unique terms, none with stored results, and a depth of `3` costs 3 × 4 = 12 credits.
Terms are case-sensitive, so `Coffee` and `coffee` are 2 terms.

AlsoAsked removes whitespace (spaces, tabs, and line breaks) and invisible characters, such as a zero-width space, at
the start and at the end of each term. If 2 terms in a search are the same after that, AlsoAsked searches the term once
and charges for the term once. For example, a search with the term `how to brew coffee` and the same text with a
space before it or after it costs the same as a search with only the term `how to brew coffee`.

## When AlsoAsked charges credits

AlsoAsked charges the credits for a search when AlsoAsked creates the search, before the search starts. AlsoAsked
charges the credits in the same way for a synchronous search and an asynchronous search.

## Stored results are free

On the live API, a term costs nothing if AlsoAsked uses stored results for it. AlsoAsked uses stored results when the
`fresh` field in the `POST /v1.1/search` request body is `false`, which is the default value, and an earlier search by
any account stored results for the same term, language code, region code, depth, and location. For the full rules, see
[Searches with stored results](./how-a-search-runs.md#searches-with-stored-results).

If you set the `fresh` field to `true`, AlsoAsked gets new results from Google for every term, and every term costs
credits.

## Credit refunds

AlsoAsked refunds credits in these cases:

- **A term ends with the `error` status or the `no_results` status.** AlsoAsked refunds the credits for that term,
  including a term that fails because it passed its deadline. See
  [How long a search can take](./how-a-search-runs.md#how-long-a-search-can-take).
- **An error happens in AlsoAsked while it creates, queues, or waits for the search.** The API returns the status code
  `500 Internal Server Error` with the error type `internal_server`. AlsoAsked refunds the credits of every term that
  isn't complete. If AlsoAsked already recorded the search, those terms get the status `error`.
- **You delete a search that's still running, and a term then ends with the `error` status or the `no_results`
  status.** Deleting a search doesn't stop it, so AlsoAsked refunds only those terms, as for a search that you don't
  delete. AlsoAsked doesn't refund a term that succeeds after you delete the search. See
  [Delete a search](./search-history.md#delete-a-search).

AlsoAsked returns refunds to the kind of credit that paid for the term.

## Not enough credits

If your account doesn't have enough credits for a search, the `POST /v1.1/search` endpoint returns the status code
`402 Payment Required` with the error type `insufficient_credits`. AlsoAsked doesn't search for any term of the search,
and doesn't charge any credits for that request. AlsoAsked checks the credits after it removes the terms with stored
results, so those terms don't count.

## Automatic top-up and low-credit emails

If your credits fall below 100 after a search, AlsoAsked can buy pay-as-you-go credits for you automatically. To turn on
automatic top-up, go to the [**Pay-as-you-go credits** page](https://alsoasked.com/credits). In the **Automatic
top-up** section, choose the number of credits to buy, and select **Enable auto top-up**. AlsoAsked charges the card
that pays for your plan. If automatic top-up is off, AlsoAsked sends you an email instead when your credits fall below
100.

In a team, only the team owner can change automatic top-up, and only the team owner's own searches start an automatic
top-up or send the email. The searches of team members use the team owner's credits, but don't start an automatic
top-up. For details about teams, see [Teams](./account.md#teams).

For details about the `insufficient_credits` error type and other errors, see [Errors](./errors.md).

## Check your credits

To see the credits in your account, send a request to the `GET /v1.1/account` endpoint. The following request gets the
account details from the live API:

```bash
curl --request GET 'https://alsoaskedapi.com/v1.1/account' \
  --header 'X-Api-Key: YOUR_LIVE_API_KEY'
```

Replace `YOUR_LIVE_API_KEY` with your live API key, which starts with `aa-live-`.

The `GET /v1.1/account` response body has these credit fields:

| Name | Description |
| --- | --- |
| `credits` | The total credits of the account: the value of the `web_credits` field plus the value of the `api_credits` field. |
| `web_credits` | The plan credits of the account. |
| `api_credits` | The pay-as-you-go credits of the account. |
| `credits_reset_at` | The date and time when the plan credits of the account renew, in ISO 8601 format. |

The `web_credits` and `api_credits` fields have their names from an earlier time, when pay-as-you-go credits paid only
for searches on the AlsoAsked API. Pay-as-you-go credits now also pay for searches on the AlsoAsked website. The field
names stay the same for backward compatibility: the `web_credits` field has your plan credits, and the `api_credits`
field has your pay-as-you-go credits.

Responses from the AlsoAsked API also have the `X-AlsoAsked-Credits` header, not only the `GET /v1.1/account` response.
On the live API, the `X-AlsoAsked-Credits` header contains the plan credits plus the pay-as-you-go credits that remain,
after the request. The header is in successful responses and in most error responses, including `402 Payment Required`
with the error type `insufficient_credits`. The header isn't in these responses:

- `401 Unauthorized` and `403 Forbidden`.
- `402 Payment Required` with the error type `insufficient_plan`.
- `429 Too Many Requests` from the rate limit, and `500 Internal Server Error` when the check of the rate limit itself
  fails.
- `404 Not Found` or `405 Method Not Allowed` for a path or method that the API doesn't have, and
  `413 Content Too Large`. See [Responses in other formats](./errors.md#responses-in-other-formats).

For details about the account fields, see [Account details](./account.md).

## Sandbox credits

The sandbox API uses sandbox credits, not the credits of your plan. Each term of a search on the sandbox API costs the
same number of sandbox credits as a term on the live API. The sandbox API has no stored results, so every term costs
sandbox credits, whatever the value of the `fresh` field. Each account has 1,000 sandbox credits. Sandbox credits reset
to the full amount 24 hours after the last reset. On the sandbox API, the `X-AlsoAsked-Credits` header contains the
sandbox credits that remain. For details, see [Sandbox API](./sandbox.md).

## Related

- [Account details](./account.md)
- [Perform a search](./perform-a-search.md)
- [Sandbox API](./sandbox.md)
- [Errors](./errors.md)
- [OpenAPI specification](../openapi/openapi.yaml)
