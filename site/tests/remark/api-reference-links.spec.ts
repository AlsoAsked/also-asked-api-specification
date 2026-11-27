import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Definition, Link, Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { visit } from 'unist-util-visit';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import remarkApiReferenceLinks from '../../src/remark/api-reference-links';

let directory: string;
let operationRoutesFile: string;

beforeAll(() => {
  directory = mkdtempSync(join(tmpdir(), 'api-reference-links-'));
  operationRoutesFile = join(directory, 'operation-routes.json');
  writeFileSync(
    operationRoutesFile,
    JSON.stringify({
      '/paths/~1search/post': '/api/perform-search',
      '/paths/~1search~1{searchId}/delete': '/api/delete-search',
    }),
  );
});

afterAll(() => {
  rmSync(directory, { recursive: true, force: true });
});

function transform(markdown: string): Root {
  const tree = fromMarkdown(markdown);
  remarkApiReferenceLinks({ operationRoutesFile })(tree);
  return tree;
}

function urls(tree: Root): string[] {
  const found: string[] = [];
  visit(tree, (node) => {
    if (node.type === 'link' || node.type === 'definition') {
      found.push((node as Link | Definition).url);
    }
  });
  return found;
}

describe('remarkApiReferenceLinks', () => {
  it('points a link to the bundle at the API introduction', () => {
    expect(urls(transform('[OpenAPI specification](../openapi/openapi.yaml)'))).toEqual(['/api']);
  });

  it('points a JSON pointer to an operation at the operation page', () => {
    const tree = transform(
      [
        '[Perform a search](../openapi/openapi.yaml#/paths/~1search/post)',
        '[Delete](../openapi/openapi.yaml#/paths/~1search~1%7BsearchId%7D/delete)',
      ].join('\n'),
    );

    expect(urls(tree)).toEqual(['/api/perform-search', '/api/delete-search']);
  });

  it('rewrites link definitions too', () => {
    expect(urls(transform('[spec]\n\n[spec]: ../openapi/openapi.yaml'))).toEqual(['/api']);
  });

  it('leaves other links unchanged', () => {
    const markdown = '[Sandbox](./sandbox.md#test-terms) [Pricing](https://alsoasked.com/pricing)';

    expect(urls(transform(markdown))).toEqual([
      './sandbox.md#test-terms',
      'https://alsoasked.com/pricing',
    ]);
  });

  it('fails on a fragment that is not an operation', () => {
    expect(() => transform('[Search](../openapi/openapi.yaml#/components/schemas/Search)')).toThrow(
      "The link ../openapi/openapi.yaml#/components/schemas/Search doesn't point at an operation.",
    );
  });
});
