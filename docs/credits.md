---
title: Credits
description: Learn how AlsoAsked charges credits for searches, how to calculate the cost of a search, and how to check the credits in your account.
type: concept
---

# Credits

AlsoAsked uses credits to charge for searches. Each search costs credits for each term, and the cost depends on the
depth of the search. Read this page to know what a search costs, when AlsoAsked charges and refunds credits, and how to
check the credits in your account.

## Web credits and API credits

An AlsoAsked account has two kinds of credits:

- **Web credits** come with your plan, and renew each month. When your web credits renew, AlsoAsked sets them to the
  full amount of your plan, so web credits that you didn't use don't carry over. The `credits_reset_at` field in the
  `GET /v1.1/account` response body shows when your web credits renew next.
- **API credits** are credits that you buy. API credits don't expire and don't renew. You can use them only while your
  account has a Pro plan.

Both kinds of credits pay for searches on the AlsoAsked API and on the AlsoAsked website. AlsoAsked uses your web
credits first, and charges each term to one kind of credit only. If the web credits that remain are fewer than the cost
of a term, AlsoAsked charges that term and every later term of the search to your API credits, and the remaining web
credits stay in your account.

Because each term is paid by one kind of credit, a search can fail with `insufficient_credits` even if the total of your
credits is enough. For example, with 3 web credits and 3 API credits, a term at a depth of `3`, which costs 4 credits,
gets `402 Payment Required`: neither kind of credit has 4 credits.

For plans and prices, see the [AlsoAsked pricing page](https://alsoasked.com/pricing).

## Cost of a search

On the live API with a Pro plan, the cost for each term depends on the depth of the search:

| Depth | Cost for each term |
| --- | --- |
| `1` | 1 credit |
| `2` | 1 credit |
| `3` | 4 credits |

A depth of `1` is available on the live API, the sandbox API, and the AlsoAsked MCP server, but not on the AlsoAsked
website. If you don't set the `depth` field in the
`POST /v1.1/search` request body, the depth is `2`.

On the live API, the cost of a search is the number of unique terms without stored results, multiplied by the cost for
each term at the depth of the search:

```text
cost of a search = number of unique terms without stored results × cost for each term at the depth
```

For example, a search with 3 unique terms, none with stored results, and a depth of `3` costs 3 × 4 = 12 credits.
Terms are case-sensitive, so `Coffee` and `coffee` are two terms.

AlsoAsked removes spaces at the start and the end of each term. If two terms in a search are the same after AlsoAsked
removes the spaces, AlsoAsked searches the term once and charges for the term once. For example, a search with the terms
`how to brew coffee` and ` how to brew coffee ` costs the same as a search with only the term `how to brew coffee`.

## When AlsoAsked charges credits

AlsoAsked charges the credits for a search when AlsoAsked creates the search, before the search starts. AlsoAsked
charges the credits in the same way for a synchronous search and an asynchronous search.

## Stored results are free

On the live API, a term costs nothing if AlsoAsked already stored results for the same term, language code, region
code, depth, and location (`latitude` and `longitude`), and the `fresh` field in the `POST /v1.1/search` request body is
`false`. The stored results can come from an earlier search by any account, and can be any age. The default value of
the `fresh` field is `false`. AlsoAsked doesn't use stored results whose top-level answer is blank, so such a term
costs credits.

If you set the `fresh` field to `true`, AlsoAsked gets new results from Google for every term, and every term costs
credits.

## Credit refunds

AlsoAsked refunds credits in these cases:

- **A term ends with the `error` status or the `no_results` status.** AlsoAsked refunds the credits for that term,
  including a term that fails because it passed its deadline. See
  [How long a search can take](./searches.md#how-long-a-search-can-take).
- **The search fails before AlsoAsked queues the search.** The API returns the status code `500 Internal Server Error`,
  and AlsoAsked refunds all the credits for the search.

## Not enough credits

If your account doesn't have enough credits for a search, the `POST /v1.1/search` endpoint returns the status code
`402 Payment Required` with the error type `insufficient_credits`. AlsoAsked doesn't perform any term of the search,
and doesn't charge any credits for that request. AlsoAsked checks the credits after it removes the terms with stored
results, so those terms don't count.

AlsoAsked returns refunds to the kind of credit that paid for the term.

## Automatic top-up and low-credit emails

If your credits fall below 100 after a search, AlsoAsked can buy API credits for you automatically. To turn on automatic
top-up, go to the **Pay-as-you-go credits** page at `https://alsoasked.com/credits`. In the **Automatic top-up**
section, choose the number of credits to buy, and select **Enable auto top-up**. AlsoAsked charges the card of your
subscription. If automatic top-up is off, AlsoAsked sends you an email instead when your credits fall below 100.

In a team, only the team owner can change automatic top-up, and only the team owner's own searches start an automatic
top-up or send the email. The searches of team members use the team owner's credits, but don't start an automatic
top-up. For details about teams, see [Teams](./account.md#teams).

For details about the `insufficient_credits` error type and other errors, see [Errors](./errors.md).

## Check your credits

To see the credits in your account, send a request to the `GET /v1.1/account` endpoint. The following request gets the
account details from the live API:

```bash
curl --request GET 'https://alsoaskedapi.com/v1.1/account' \
  --header 'X-Api-Key: YOUR_API_KEY'
```

Replace `YOUR_API_KEY` with your live API key, which starts with `aa-live-`.

The `GET /v1.1/account` response body has these credit fields:

| Name | Description |
| --- | --- |
| `credits` | The total credits of the account: the value of the `web_credits` field plus the value of the `api_credits` field. |
| `web_credits` | The web credits of the account. |
| `api_credits` | The API credits of the account. |
| `credits_reset_at` | The date and time when the web credits of the account renew, in ISO 8601 format. |

Responses from the AlsoAsked API also have the `X-AlsoAsked-Credits` header, not only the `GET /v1.1/account`
response. On the live API, the `X-AlsoAsked-Credits` header contains the web credits plus the API credits that remain,
after the request. The header is in successful responses and in most error responses, including
`402 Payment Required` with the error type `insufficient_credits`. The header isn't in these responses:

- `401 Unauthorized` and `403 Forbidden`, because AlsoAsked doesn't know the account.
- `402 Payment Required` with the error type `insufficient_plan`.
- `429 Too Many Requests` from the rate limit, and the responses in other formats that
  [Errors](./errors.md#responses-in-other-formats) lists.
For details about the account fields, see [Account details](./account.md).

## Sandbox credits

The sandbox API uses sandbox credits, not the credits of your plan. A search on the sandbox API costs the same number of
sandbox credits as a search with a Pro plan on the live API. The sandbox API has 1,000 sandbox credits.
Sandbox credits reset to the full amount 24 hours after the last reset.
On the sandbox API, the `X-AlsoAsked-Credits` header contains the sandbox credits that remain. For details, see
[Sandbox API](./sandbox.md).

## Related

- [Account details](./account.md)
- [Perform a search](./perform-a-search.md)
- [Sandbox API](./sandbox.md)
- [Errors](./errors.md)
- [OpenAPI specification](../openapi/openapi.yaml)
