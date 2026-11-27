// The changes that scripts/generate-api-docs.mts makes to its copy of the OpenAPI bundle and to the
// pages that the openapi-docs plugin generates from it.
import kebabCase from 'lodash/kebabCase.js';
import { type Document, isMap, isScalar, isSeq } from 'yaml';

const GUIDE_LINK = /\]\(\.\.\/docs\/([a-z0-9-]+)\.md(#[^)\s]*)?\)/g;
const RELATIVE_LINK = /\]\(\.\.\//;
const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
const INTRODUCTION_ID = /^---\nid: alsoasked-api\n/;
const INTRODUCTION_INFO_PATH = /^info_path: api\/\/alsoasked-api$/m;

// Points the links to guide pages (`../docs/<page>.md#anchor`) at the guide page routes.
export function rewriteGuideLinks(source: string): { text: string; count: number } {
  let count = 0;
  const text = source.replace(GUIDE_LINK, (_match, page: string, anchor = '') => {
    count++;
    return `](/docs/${page}${anchor})`;
  });
  if (RELATIVE_LINK.test(text)) {
    throw new Error("The OpenAPI bundle has a relative link that isn't a link to a guide page.");
  }
  return { text, count };
}

// Moves the sandbox server to the front of the servers list.
export function putSandboxServerFirst(document: Document): void {
  const servers = document.get('servers');
  if (!isSeq(servers)) {
    throw new Error('The OpenAPI bundle has no servers list.');
  }
  const index = servers.items.findIndex((server) => {
    const url = isMap(server) ? server.get('url') : undefined;
    return typeof url === 'string' && new URL(url).hostname.startsWith('sandbox.');
  });
  if (index < 0) {
    throw new Error('The OpenAPI bundle has no sandbox server.');
  }
  servers.items.unshift(...servers.items.splice(index, 1));
}

// Replaces exactly one match, so a change in the plugin output fails the build.
function replaceOnce(page: string, pattern: RegExp, replacement: string): string {
  if (!pattern.test(page)) {
    throw new Error(`The page doesn't match ${pattern}. Check the openapi-docs plugin output.`);
  }
  return page.replace(pattern, replacement);
}

// Serves the API introduction page at the root of the API reference (/api).
export function withIntroductionAtRoot(page: string): string {
  return replaceOnce(page, INTRODUCTION_ID, '---\nid: alsoasked-api\nslug: /\n');
}

// Points an operation page's link to the introduction's #authentication section at /api. The theme
// builds that link from info_path in the browser, so the build's link check doesn't see it.
export function withIntroductionInfoPath(page: string): string {
  return replaceOnce(page, INTRODUCTION_INFO_PATH, 'info_path: api');
}

// Builds a JSON pointer (RFC 6901) from its reference tokens.
export function jsonPointer(...tokens: string[]): string {
  return `/${tokens.map((token) => token.replaceAll('~', '~0').replaceAll('/', '~1')).join('/')}`;
}

// Maps the JSON pointer of each operation and webhook to its page. pageExists says whether the
// plugin generated a page with the given ID.
export function operationRoutes(
  document: Document,
  pageExists: (id: string) => boolean,
): Record<string, string> {
  const routes: Record<string, string> = {};
  for (const section of ['paths', 'webhooks']) {
    const items = document.get(section);
    if (!isMap(items)) {
      continue;
    }
    for (const { key, value } of items.items) {
      if (!(isScalar(key) && isMap(value))) {
        continue;
      }
      for (const method of HTTP_METHODS) {
        const operationId = value.getIn([method, 'operationId']);
        if (typeof operationId !== 'string') {
          continue;
        }
        // The plugin names each operation page after its operationId in kebab case.
        const id = kebabCase(operationId);
        if (!pageExists(id)) {
          throw new Error(`No API reference page for ${operationId} (expected ${id}).`);
        }
        routes[jsonPointer(section, String(key.value), method)] = `/api/${id}`;
      }
    }
  }
  return routes;
}
