---
stoplight-id: la1fgjm2kahnf
---

# Installation

Although the AlsoAsked API is accessible through HTTP requests, we recommend using one of our client libraries to make integration easier.

## Client libraries

### PHP

The AlsoAsked PHP client library is available on [GitHub](https://github.com/AlsoAsked/also-asked-php) and [Packagist](https://packagist.org/packages/alsoasked/also-asked-php).

If you're using Composer, you can install the library by running the following command:

```bash
composer require alsoasked/also-asked-php
```

#### Example

The below example will fetch your account details from the **Live** API, check you have enough credits, and then search for the term cars in US English.

You'll need to change `your-api-key` to the API key you've created, if you don't have an API key, follow the [**authentication guide**](/docs/also-asked/j389o9lgezike-authentication).

If you wish to run this against the **Sandbox** API, then change `https://alsoaskedapi.com/v1` in the `BaseUriPlugin` to `https://sandbox.alsoaskedapi.com/v1`.

```php
<?php

declare(strict_types=1);

use AlsoAsked\Api\Authentication\ApiKeyAuthentication;
use AlsoAsked\Api\Client;
use AlsoAsked\Api\Model\SearchRequestOptions;
use AlsoAsked\Api\Model\SearchResult;
use Http\Client\Common\Plugin\BaseUriPlugin;
use Http\Client\Common\PluginClientBuilder;
use Http\Discovery\Psr18ClientDiscovery;
use Http\Discovery\UriFactoryDiscovery;
use Jane\Component\OpenApiRuntime\Client\Plugin\AuthenticationRegistry;

require_once 'vendor/autoload.php';

$httpClient = (new PluginClientBuilder())
    // add a base URI plugin to point to the live API url
    ->addPlugin(new BaseUriPlugin(UriFactoryDiscovery::find()->createUri('https://alsoaskedapi.com/v1')))
    // add an authentication plugin to add the API key
    ->addPlugin(new AuthenticationRegistry([new ApiKeyAuthentication('your-api-key')]))
    // create the PSR-18 HTTP client
    ->createClient(Psr18ClientDiscovery::find());

// create the API client with the PSR-18 HTTP client
$apiClient = Client::create($httpClient);

// fetch our account details

/**
 * @var \AlsoAsked\Api\Model\Account
 */
$account = $apiClient->getAccount();

// check if the account has any credits left
if ($account->getCredits() === 0) {
    echo 'You have no credits left, please top up your account.';

    exit;
}

// define the options for a search request
$request = (new SearchRequestOptions())
    ->setTerms(['cars'])
    ->setLanguage('en')
    ->setRegion('us')
    ->setDepth(2)
    ->setFresh(false)
    ->setAsync(false)
    ->setNotifyWebhooks(true);

// perform a search request in US English for the term 'cars'

/**
 * @var \AlsoAsked\Api\Model\SearchRequestResults
 */
$results = $apiClient->performSearch($request);

// ensure the search request was successful
if ($results->getStatus() !== 'success') {
    echo 'The search request doesn\'t have the "success" status: ' . $results->getStatus();

    exit;
}

/**
 * Recursively print a search result and it's children.
 *
 * @param \AlsoAsked\Api\Model\SearchResult $result
 *
 * @return void
 */
function printResult(SearchResult $result): void
{
    echo '- Question: ' . $result->getQuestion() . \PHP_EOL;

    foreach ($result->getResults() as $childResult) {
        \printResult($childResult);
    }
}

// print the queries and their results

foreach ($results->getQueries() as $query) {
    echo 'Term: ' . $query->getTerm() . \PHP_EOL;
    echo 'Results:' . \PHP_EOL;

    foreach ($query->getResults() as $result) {
        \printResult($result);
    }
}
```
