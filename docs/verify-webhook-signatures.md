---
title: Verify webhook signatures
description: Verify the signature of each webhook event, so that you only use webhook events that AlsoAsked sent.
type: task
---

# Verify webhook signatures

AlsoAsked signs each webhook event with your webhook signing key and puts the signature in the
`X-AlsoAsked-Signature` header. Verify the signature before you use the body of a webhook event. A correct signature
shows that AlsoAsked sent the webhook event and that nobody changed the body.

## Before you start

- You need a webhook endpoint that receives webhook events from AlsoAsked. For how to add a webhook endpoint, see
  [Webhooks](./webhooks.md).
- You need your webhook signing key. The webhook signing key belongs to your account, and one webhook signing key signs
  the webhook events for all webhook endpoints of your account.
- You need a way to read the raw request body in your server code, as bytes, before your web framework parses the JSON.

To get a webhook signing key, go to **Developers** > **Webhooks** on the AlsoAsked website. You generate the webhook
signing key when you add your first webhook endpoint. AlsoAsked shows the webhook signing key only once, so store it in
a safe place. To create a new webhook signing key, select **Regenerate signing key** in the **Webhook signing key**
section of **Developers** > **Webhooks**.

<!-- PENDING W22: verify UI labels -->

## How AlsoAsked makes the signature

The value of the `X-AlsoAsked-Signature` header is a Hash-based Message Authentication Code (HMAC) with the Secure Hash
Algorithm 384 (SHA-384) hash function. AlsoAsked makes the signature in the following way:

1. AlsoAsked joins the raw request body, a period (`.`), and the value of the `X-AlsoAsked-Timestamp` header, in that
   order. The body comes first.
2. AlsoAsked calculates the HMAC-SHA384 of the joined value with your webhook signing key as the key.
3. AlsoAsked writes the HMAC as hexadecimal characters. The signature has 96 hexadecimal characters.

As a formula, the signature is:

```text
hex(HMAC-SHA384(webhook signing key, raw request body + "." + X-AlsoAsked-Timestamp))
```

The value of the `X-AlsoAsked-Timestamp` header is the Unix time, in seconds, when AlsoAsked sent the request. If
AlsoAsked sends a webhook event again after a failed attempt, AlsoAsked sets a new timestamp and a new signature for
the new attempt.

## Steps

To verify the signature of a webhook event, do the following steps in the code of your webhook endpoint:

1. Read the raw request body exactly as your server receives the request body. Don't parse the JSON first.
2. Read the value of the `X-AlsoAsked-Timestamp` header and the value of the `X-AlsoAsked-Signature` header.
3. Make sure that the value of the `X-AlsoAsked-Timestamp` header is recent. Reject the webhook event if the timestamp
   is more than 5 minutes from the current time on your server. The 5-minute limit is a recommendation, not a rule of
   the AlsoAsked API. A short limit stops an attacker from sending an old webhook event to your webhook endpoint again.
   A short limit is safe because AlsoAsked sets a new timestamp for each attempt.
4. Calculate the expected signature: the hexadecimal HMAC-SHA384 of the raw request body, a period (`.`), and the
   value of the `X-AlsoAsked-Timestamp` header, with your webhook signing key as the key.
5. Compare the expected signature with the value of the `X-AlsoAsked-Signature` header in constant time. Use a
   comparison function for secrets, such as `hmac.compare_digest` in Python, `crypto.timingSafeEqual` in Node.js, or
   `hash_equals` in PHP.
6. If the two signatures aren't equal, reject the webhook event and don't use the request body.

## Verify a signature in Python

The following `verify` function in Python uses only the standard library. The function returns `True` if the
signature is correct and the timestamp is recent. Otherwise, the function returns `False`.

```python
import hashlib
import hmac
import time

MAX_AGE_SECONDS = 300  # 5 minutes


def verify(signing_key: str, raw_body: bytes, timestamp: str, signature: str) -> bool:
    """Return True if AlsoAsked signed this webhook event and the timestamp is recent."""
    if not (timestamp.isascii() and timestamp.isdigit()):
        return False
    if abs(time.time() - int(timestamp)) > MAX_AGE_SECONDS:
        return False

    message = raw_body + b"." + timestamp.encode("ascii")
    expected = hmac.new(signing_key.encode("utf-8"), message, hashlib.sha384).hexdigest()
    return hmac.compare_digest(expected.encode("ascii"), signature.encode("utf-8"))
```

Give the `raw_body` argument of the Python `verify` function the request body as bytes. For example, in Flask, use
`request.get_data()`, and read the headers from `request.headers`. Don't use `request.get_json()` for the `raw_body`
argument.

## Verify a signature in Node.js

The following `verify` function in Node.js uses the `crypto` module. The function returns `true` if the signature is
correct and the timestamp is recent. Otherwise, the function returns `false`.

```javascript
const crypto = require('node:crypto');

const MAX_AGE_SECONDS = 300; // 5 minutes

function verify(signingKey, rawBody, timestamp, signature) {
  if (typeof timestamp !== 'string' || !/^\d+$/.test(timestamp)) {
    return false;
  }
  if (typeof signature !== 'string') {
    return false;
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - Number(timestamp)) > MAX_AGE_SECONDS) {
    return false;
  }

  const expected = crypto
    .createHmac('sha384', signingKey)
    .update(Buffer.concat([rawBody, Buffer.from('.' + timestamp, 'ascii')]))
    .digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const signatureBuffer = Buffer.from(signature, 'utf8');
  return expectedBuffer.length === signatureBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

module.exports = { verify };
```

Give the `rawBody` argument of the Node.js `verify` function the request body as a `Buffer`. For example, in Express,
use the `express.raw({ type: 'application/json' })` middleware on the route of your webhook endpoint, and use
`req.body`. Read the headers with `req.get('X-AlsoAsked-Timestamp')` and `req.get('X-AlsoAsked-Signature')`. Don't use
the `express.json()` middleware on the route of your webhook endpoint.

## Verify a signature in PHP

The following `verify` function in PHP uses the `hash_hmac` function and the `hash_equals` function. The function
returns `true` if the signature is correct and the timestamp is recent. Otherwise, the function returns `false`.

```php
<?php

declare(strict_types=1);

const MAX_AGE_SECONDS = 300; // 5 minutes

function verify(string $signingKey, string $rawBody, string $timestamp, string $signature): bool
{
    if (!ctype_digit($timestamp)) {
        return false;
    }
    if (abs(time() - (int) $timestamp) > MAX_AGE_SECONDS) {
        return false;
    }

    $expected = hash_hmac('sha384', $rawBody . '.' . $timestamp, $signingKey);

    return hash_equals($expected, $signature);
}
```

Give the `$rawBody` argument of the PHP `verify` function the request body as a string. For example, use
`file_get_contents('php://input')`, and read the headers from `$_SERVER['HTTP_X_ALSOASKED_TIMESTAMP']` and
`$_SERVER['HTTP_X_ALSOASKED_SIGNATURE']`. Don't use the result of `json_decode` for the `$rawBody` argument.

## Result

If the signature is correct and the timestamp is recent, the `verify` function returns `true` (`True` in Python).
Your webhook endpoint can then parse the JSON in the request body and use the webhook event.

If the `verify` function returns `false` (`False` in Python), reject the request,
for example with the status code `401 Unauthorized`, and don't use the request body.

## Common mistakes

A signature can fail to match even when AlsoAsked sent the webhook event. The following mistakes are the usual causes:

- **Parsing the JSON and serializing the JSON again.** The request body escapes a slash (`/`) as `\/` and each character
  outside the American Standard Code for Information Interchange (ASCII) set as `\uXXXX`. For example, the request body
  contains `https:\/\/example.com` and `caf\u00e9`. If you parse the JSON and serialize the JSON again, the new bytes
  can differ from the request body, and the signature doesn't match. Use the raw request body exactly as AlsoAsked sent
  the request body.
- **Joining the values in the wrong order.** The signature uses the raw request body first, then a period (`.`), then
  the value of the `X-AlsoAsked-Timestamp` header. If you put the timestamp first, the signature doesn't match.
- **Changing the request body.** Don't trim spaces or line breaks from the request body, and don't change the character
  encoding. Any change to the bytes changes the signature.
- **Comparing the signatures with `==` or `===`.** A normal string comparison can take less time when the first
  characters differ, and an attacker can use the difference in time to guess a signature. Use a constant-time
  comparison function, such as `hmac.compare_digest` in Python, `crypto.timingSafeEqual` in Node.js, or `hash_equals`
  in PHP.
- **Using an old webhook signing key.** After you select **Regenerate signing key**, the old webhook signing key
  doesn't match the signature of new webhook events. Update the webhook signing key on your server.

## IP addresses of webhook events

AlsoAsked sends webhook events from the IP address `18.168.235.198`.

If your firewall allows requests only from known IP addresses, allow this IP address for your webhook endpoint. An IP
address doesn't show that AlsoAsked sent a webhook event, so verify the signature of each webhook event too.

## If there is a problem

| Problem | Cause | What to do |
| --- | --- | --- |
| The signature never matches. | Your code parses the JSON in the request body and serializes the JSON again before it calculates the signature. | Calculate the signature from the raw request body, before you parse the JSON. |
| The signature never matches. | Your code joins the value of the `X-AlsoAsked-Timestamp` header before the request body. | Join the raw request body, a period (`.`), and the value of the `X-AlsoAsked-Timestamp` header, in that order. |
| The signature never matches. | You use an old webhook signing key, or the webhook signing key has extra spaces from a copy. | Use the current webhook signing key, exactly as AlsoAsked showed it. If you lost the webhook signing key, select **Regenerate signing key**. |
| The signature matches only for some webhook events. | Your server, your proxy, or your web framework changes the request body, for example it trims the request body or changes the character encoding. | Read the raw request body before any middleware changes the request body. |
| The `verify` function returns `false` for every webhook event, but the signature is correct. | The clock on your server is wrong, so the timestamp looks older than 5 minutes. | Synchronize the clock on your server, for example with the Network Time Protocol (NTP). |
| Node.js throws `RangeError` from `crypto.timingSafeEqual`. | The two buffers have different lengths. | Compare the lengths of the two buffers before you call `crypto.timingSafeEqual`, as the Node.js `verify` function does. |

## Related

- [Webhooks](./webhooks.md)
- [OpenAPI specification](../openapi/openapi.yaml)
