---
stoplight-id: bomfn6xy30nih
---

# Sandbox

The **Sandbox** environment allows you to test the AlsoAsked API without using any credits. The **Sandbox** environment is identical to the **Live** environment, except that it does not return real search results.

Unlike the **Live** environment, the **Sandbox** environment is available to all users, including those on the free plan.

## Endpoints

The **Sandbox** environment uses the same endpoints as the **Live** environment, but with a different base URL. To use the **Sandbox** environment, use the following base URL:

```
https://sandbox.alsoaskedapi.com
```

## Authentication

To authenticate requests to the **Sandbox** environment, you must include your **Sandbox** API key in the `X-Api-Key` header.

To create an API key for the **Sandbox** environment, follow the steps in the [**Creating an API key**](/docs/also-asked/j389o9lgezike-authentication#creating-an-api-key) guide, changing the **environment** to **Sandbox**.

Live API keys will not work in the **Sandbox** environment, and vice versa.

```json http
{
  "method": "GET",
  "url": "https://sandbox.alsoaskedapi.com/v1/account",
  "headers": {
    "Content-Type": "application/json",
    "X-Api-Key": "aa-sandbox-"
  }
}
```

## Credits

The **Sandbox** environment provides all users with 1000 free credits per day. These credits are only available in the **Sandbox** environment, and cannot be used in the **Live** environment.

<!-- theme: info -->
> #### Increasing sandbox credits
>
> If you need a higher number of daily sandbox credits to test the API, or need them reset sooner than 24 hours, please [contact us](mailto:help@alsoasked.com).

## Search results

The **Sandbox** environment returns the same results schema as the **Live** environment, but with the following differences:

- The results are not real search results, and are generated randomly.
- The results are not cached, and will be different each time you make a request.
