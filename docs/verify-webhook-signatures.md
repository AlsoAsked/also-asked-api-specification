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
  the webhook events for all webhook endpoints of your account. The same key signs the webhook events of the live API
  and the sandbox API.
- You need a way to read the raw request body in your server code, as bytes, before your web framework parses the JSON.

## Get or regenerate your webhook signing key

To get a webhook signing key, sign in to AlsoAsked, go to the [**Webhooks**
page](https://alsoasked.com/developer/webhooks), and select **Generate signing key** in the **Webhook signing key**
section. AlsoAsked shows the webhook signing key only once, so store it in a safe place. The webhook signing key is 96
hexadecimal characters. Use these characters as the key exactly as they are, as text: don't decode them from hexadecimal
into bytes.

To create a new webhook signing key, select **Regenerate signing key** in the **Webhook signing key** section. The new
webhook signing key replaces the old one immediately, and AlsoAsked signs every later attempt with it, including the
retries of webhook events that it first sent before the change. There's no period when both webhook signing keys are
in use, so update your server with the new webhook signing key at the same time. If your server rejects a webhook
event during the change, AlsoAsked sends it again, with a signature made with the new webhook signing key.

## How AlsoAsked makes the signature

The value of the `X-AlsoAsked-Signature` header is a hash-based message authentication code (HMAC) that uses the Secure
Hash Algorithm 384 (SHA-384) hash function. AlsoAsked makes the signature in the following way:

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
6. If the 2 signatures aren't equal, reject the webhook event and don't use the request body.

## Verify a signature in Python

The following `verify` function in Python uses only the standard library and needs Python 3.10 or later. The function
returns `True` if the signature is correct and the timestamp is recent. Otherwise, the function returns `False`, also
when a header is missing.

```python
import hashlib
import hmac
import time

MAX_AGE_SECONDS = 300  # 5 minutes


def verify(signing_key: str, raw_body: bytes, timestamp: str | None, signature: str | None) -> bool:
    """Return True if AlsoAsked signed this webhook event and the timestamp is recent.

    Args:
        signing_key: Your webhook signing key, as the 96 hexadecimal characters that AlsoAsked showed.
        raw_body: The request body as bytes, exactly as your server received it.
        timestamp: The value of the X-AlsoAsked-Timestamp header, or None if the header is missing.
        signature: The value of the X-AlsoAsked-Signature header, or None if the header is missing.
    """
    if timestamp is None or signature is None:
        return False
    # A Unix time in seconds has about 10 digits. The length check also keeps int() from failing on a huge value.
    if not (timestamp.isascii() and timestamp.isdigit() and len(timestamp) <= 12):
        return False
    if abs(time.time() - int(timestamp)) > MAX_AGE_SECONDS:
        return False

    message = raw_body + b"." + timestamp.encode("ascii")
    expected = hmac.new(signing_key.encode("utf-8"), message, hashlib.sha384).hexdigest()
    # compare_digest takes the same time whether or not the signatures match.
    return hmac.compare_digest(expected.encode("ascii"), signature.encode("utf-8"))
```

Give the `raw_body` argument of the Python `verify` function the request body as bytes. Don't give it parsed JSON.
The following example uses the `verify` function in a Flask webhook endpoint. The webhook signing key comes from an
environment variable:

```python
import os

from flask import Flask, request

app = Flask(__name__)
SIGNING_KEY = os.environ["ALSOASKED_WEBHOOK_SIGNING_KEY"]


@app.post("/alsoasked-webhooks")
def alsoasked_webhook():
    is_valid = verify(
        SIGNING_KEY,
        request.get_data(),
        request.headers.get("X-AlsoAsked-Timestamp"),
        request.headers.get("X-AlsoAsked-Signature"),
    )
    if not is_valid:
        return "", 401

    event = request.get_json()
    # Process the webhook event here, or save it and process it after you respond.
    return "", 204
```

## Verify a signature in Node.js

The following `verify` function in Node.js uses the `crypto` module. The function returns `true` if the signature is
correct and the timestamp is recent. Otherwise, the function returns `false`, also when a header is missing.

```javascript
const crypto = require('node:crypto');

const MAX_AGE_SECONDS = 300; // 5 minutes

/**
 * Check that AlsoAsked signed a webhook event and that its timestamp is recent.
 *
 * @param {string} signingKey Your webhook signing key, as the 96 hexadecimal characters that AlsoAsked showed.
 * @param {Buffer} rawBody The request body, exactly as your server received it.
 * @param {string | undefined} timestamp The value of the X-AlsoAsked-Timestamp header.
 * @param {string | undefined} signature The value of the X-AlsoAsked-Signature header.
 * @returns {boolean} true if the signature is correct and the timestamp is recent.
 */
function verify(signingKey, rawBody, timestamp, signature) {
  if (typeof timestamp !== 'string' || typeof signature !== 'string') {
    return false;
  }
  if (!/^\d+$/.test(timestamp)) {
    return false;
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - Number(timestamp)) > MAX_AGE_SECONDS) {
    return false;
  }

  const expected = crypto
    .createHmac('sha384', signingKey)
    .update(rawBody)
    .update('.' + timestamp)
    .digest('hex');

  // timingSafeEqual takes the same time whether or not the signatures match. It needs buffers of equal length.
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const signatureBuffer = Buffer.from(signature, 'utf8');
  return expectedBuffer.length === signatureBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

module.exports = { verify };
```

Give the `rawBody` argument of the Node.js `verify` function the request body as a `Buffer`. The following example
uses the `verify` function in an Express webhook endpoint. The webhook signing key comes from an environment variable:

```javascript
const express = require('express');

const app = express();
const SIGNING_KEY = process.env.ALSOASKED_WEBHOOK_SIGNING_KEY;

// express.raw gives the body as a Buffer. Don't use express.json on this route.
const rawJson = express.raw({ type: 'application/json', limit: '50mb' });

app.post('/alsoasked-webhooks', rawJson, (req, res) => {
  const isValid = Buffer.isBuffer(req.body) && verify(
    SIGNING_KEY,
    req.body,
    req.get('X-AlsoAsked-Timestamp'),
    req.get('X-AlsoAsked-Signature'),
  );
  if (!isValid) {
    res.sendStatus(401);
    return;
  }

  const event = JSON.parse(req.body.toString('utf8'));
  // Process the webhook event here, or save it and process it after you respond.
  res.sendStatus(204);
});
```

The `limit` option matters: by default, Express rejects a body larger than 100 KB, and the body of a webhook event for
a search with 1,000 terms can be about 45 MB. See [Webhook request](./webhooks.md#webhook-request).

## Verify a signature in PHP

The following `verify` function in PHP uses the `hash_hmac` function and the `hash_equals` function. The function
returns `true` if the signature is correct and the timestamp is recent. Otherwise, the function returns `false`, also
when a header is missing.

```php
<?php

declare(strict_types=1);

const MAX_AGE_SECONDS = 300; // 5 minutes

/**
 * Check that AlsoAsked signed a webhook event and that its timestamp is recent.
 *
 * @param string $signingKey Your webhook signing key, as the 96 hexadecimal characters that AlsoAsked showed.
 * @param string $rawBody The request body, exactly as your server received it.
 * @param string|null $timestamp The value of the X-AlsoAsked-Timestamp header, or null if the header is missing.
 * @param string|null $signature The value of the X-AlsoAsked-Signature header, or null if the header is missing.
 *
 * @return bool true if the signature is correct and the timestamp is recent.
 */
function verify(string $signingKey, string $rawBody, ?string $timestamp, ?string $signature): bool
{
    if ($timestamp === null || $signature === null) {
        return false;
    }
    if (!ctype_digit($timestamp)) {
        return false;
    }
    if (abs(time() - (int) $timestamp) > MAX_AGE_SECONDS) {
        return false;
    }

    $expected = hash_hmac('sha384', $rawBody . '.' . $timestamp, $signingKey);

    // hash_equals takes the same time whether or not the signatures match.
    return hash_equals($expected, $signature);
}
```

Give the `$rawBody` argument of the PHP `verify` function the request body as a string. Don't give it the result of
`json_decode`. The following example uses the `verify` function in a PHP script that's the webhook endpoint. The
webhook signing key comes from an environment variable:

```php
$signingKey = (string) getenv('ALSOASKED_WEBHOOK_SIGNING_KEY');
$rawBody = (string) file_get_contents('php://input');

$isValid = verify(
    $signingKey,
    $rawBody,
    $_SERVER['HTTP_X_ALSOASKED_TIMESTAMP'] ?? null,
    $_SERVER['HTTP_X_ALSOASKED_SIGNATURE'] ?? null,
);

if (!$isValid) {
    http_response_code(401);
    exit;
}

$event = json_decode($rawBody, true, flags: JSON_THROW_ON_ERROR);
// Process the webhook event here, or save it and process it after you respond.
http_response_code(204);
```

## Result

If the signature is correct and the timestamp is recent, the `verify` function returns `true` (`True` in Python).
Your webhook endpoint can then parse the JSON in the request body and use the webhook event.

If the `verify` function returns `false` (`False` in Python), reject the request, for example with the status code
`401 Unauthorized`, and don't use the request body.

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
  doesn't match the signature of new webhook events. Update the webhook signing key on your server, exactly as
  AlsoAsked showed it, with no extra spaces from the copy.

## IP addresses of webhook events

AlsoAsked sends webhook events from the IP address `18.168.235.198`.

If your firewall allows requests only from known IP addresses, allow this IP address for your webhook endpoint. An IP
address doesn't show that AlsoAsked sent a webhook event, so verify the signature of each webhook event too.

## If there is a problem

| Problem | Cause | What to do |
| --- | --- | --- |
| The signature never matches. | Your code makes the signature from different bytes or with a different key. The usual causes are JSON that your code parsed and serialized again, values joined in the wrong order, and an old webhook signing key. | Check each item in [Common mistakes](#common-mistakes). If you lost the webhook signing key, select **Regenerate signing key**. |
| The signature matches only for some webhook events. | Your server, your proxy, or your web framework changes the request body, for example it trims the request body or changes the character encoding. | Read the raw request body before any middleware changes the request body. |
| The `verify` function returns `false` for every webhook event, but the signature is correct. | The clock on your server is wrong, so the timestamp looks older than 5 minutes. | Synchronize the clock on your server, for example with the Network Time Protocol (NTP). |
| Node.js throws `RangeError` from `crypto.timingSafeEqual`. | The 2 buffers have different lengths. | Compare the lengths of the 2 buffers before you call `crypto.timingSafeEqual`, as the Node.js `verify` function does. |

## Related

- [Webhooks](./webhooks.md)
- [OpenAPI specification](../openapi/openapi.yaml)
