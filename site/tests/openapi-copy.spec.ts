import { describe, expect, it } from 'vitest';
import { parse, parseDocument } from 'yaml';
import {
  jsonPointer,
  operationRoutes,
  putSandboxServerFirst,
  rewriteGuideLinks,
  withIntroductionAtRoot,
  withIntroductionInfoPath,
} from '../scripts/lib/openapi-copy.mts';
import { readRepositoryFile } from './helpers';

type Servers = { servers: { url: string }[] };

const serverUrls = (yaml: string): string[] =>
  (parse(yaml) as Servers).servers.map((server) => server.url);

describe('rewriteGuideLinks', () => {
  it('points guide page links at their routes, with their anchors', () => {
    const source = [
      'description: See [Webhooks](../docs/webhooks.md) and',
      '  [the headers](../docs/rate-limits.md#rate-limit-headers).',
    ].join('\n');

    expect(rewriteGuideLinks(source)).toEqual({
      text: [
        'description: See [Webhooks](/docs/webhooks) and',
        '  [the headers](/docs/rate-limits#rate-limit-headers).',
      ].join('\n'),
      count: 2,
    });
  });

  it('fails on another relative link', () => {
    expect(() => rewriteGuideLinks('description: ![Logo](../assets/images/logo.png)')).toThrow(
      "The OpenAPI bundle has a relative link that isn't a link to a guide page.",
    );
  });

  it('rewrites every guide page link in the bundle', () => {
    const { text, count } = rewriteGuideLinks(readRepositoryFile('openapi', 'openapi.yaml'));

    expect(count).toBeGreaterThan(0);
    expect(text).not.toContain('](../');
  });
});

describe('putSandboxServerFirst', () => {
  it('moves the sandbox server to the front and keeps the order of the others', () => {
    const document = parseDocument(
      [
        'servers:',
        '  - url: https://alsoaskedapi.com/v1.1',
        '  - url: https://eu.alsoaskedapi.com/v1.1',
        '  - url: https://sandbox.alsoaskedapi.com/v1.1',
      ].join('\n'),
    );

    putSandboxServerFirst(document);

    expect(serverUrls(document.toString())).toEqual([
      'https://sandbox.alsoaskedapi.com/v1.1',
      'https://alsoaskedapi.com/v1.1',
      'https://eu.alsoaskedapi.com/v1.1',
    ]);
  });

  it('fails without a sandbox server', () => {
    const document = parseDocument('servers:\n  - url: https://alsoaskedapi.com/v1.1\n');

    expect(() => putSandboxServerFirst(document)).toThrow(
      'The OpenAPI bundle has no sandbox server.',
    );
  });

  it('fails without a servers list', () => {
    expect(() => putSandboxServerFirst(parseDocument('openapi: 3.1.0\n'))).toThrow(
      'The OpenAPI bundle has no servers list.',
    );
  });

  it('puts the sandbox server of the bundle first', () => {
    const document = parseDocument(readRepositoryFile('openapi', 'openapi.yaml'));

    putSandboxServerFirst(document);

    expect(serverUrls(document.toString())[0]).toBe('https://sandbox.alsoaskedapi.com/v1.1');
  });
});

describe('withIntroductionAtRoot', () => {
  it('adds slug: / to the introduction page', () => {
    expect(withIntroductionAtRoot('---\nid: alsoasked-api\ntitle: "AlsoAsked API"\n---\n')).toBe(
      '---\nid: alsoasked-api\nslug: /\ntitle: "AlsoAsked API"\n---\n',
    );
  });

  it('fails when the plugin output has changed', () => {
    expect(() => withIntroductionAtRoot('---\nid: another-api\n---\n')).toThrow(
      'Check the openapi-docs plugin output.',
    );
  });
});

describe('withIntroductionInfoPath', () => {
  it('points info_path at /api', () => {
    expect(
      withIntroductionInfoPath('---\nid: get-account\ninfo_path: api//alsoasked-api\n---\n'),
    ).toBe('---\nid: get-account\ninfo_path: api\n---\n');
  });

  it('fails when the page has no info_path', () => {
    expect(() => withIntroductionInfoPath('---\nid: get-account\n---\n')).toThrow(
      'Check the openapi-docs plugin output.',
    );
  });
});

describe('jsonPointer', () => {
  it('escapes ~ and / in each reference token', () => {
    expect(jsonPointer('paths', '/search/{searchId}', 'get')).toBe(
      '/paths/~1search~1{searchId}/get',
    );
    expect(jsonPointer('paths', '/a~b', 'post')).toBe('/paths/~1a~0b/post');
  });
});

describe('operationRoutes', () => {
  const document = parseDocument(
    [
      'paths:',
      '  /search:',
      '    parameters: []',
      '    get:',
      '      operationId: listSearches',
      '    post:',
      '      operationId: performSearch',
      '  /search/{searchId}:',
      '    delete:',
      '      operationId: deleteSearch',
      'webhooks:',
      '  searchStatusChanged:',
      '    post:',
      '      operationId: searchStatusChanged',
    ].join('\n'),
  );

  it('maps the pointer of each operation and webhook to its page', () => {
    expect(operationRoutes(document, () => true)).toEqual({
      '/paths/~1search/get': '/api/list-searches',
      '/paths/~1search/post': '/api/perform-search',
      '/paths/~1search~1{searchId}/delete': '/api/delete-search',
      '/webhooks/searchStatusChanged/post': '/api/search-status-changed',
    });
  });

  it('accepts a document without webhooks', () => {
    const paths = parseDocument('paths:\n  /account:\n    get:\n      operationId: getAccount\n');

    expect(operationRoutes(paths, () => true)).toEqual({
      '/paths/~1account/get': '/api/get-account',
    });
  });

  it('fails when the plugin generated no page for an operation', () => {
    expect(() => operationRoutes(document, (id) => id !== 'delete-search')).toThrow(
      'No API reference page for deleteSearch (expected delete-search).',
    );
  });

  it('maps every operation in the bundle', () => {
    const bundle = readRepositoryFile('openapi', 'openapi.yaml');
    const routes = operationRoutes(parseDocument(bundle), () => true);
    const operations = (bundle.match(/^\s+operationId:/gm) ?? []).length;

    expect(Object.keys(routes)).toHaveLength(operations);
    expect(routes['/paths/~1search/post']).toBe('/api/perform-search');
  });
});
