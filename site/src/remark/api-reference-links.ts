// The guide pages link to the API reference as `../openapi/openapi.yaml`, relative to docs/:
// - `../openapi/openapi.yaml` goes to the API introduction at /api.
// - `../openapi/openapi.yaml#/paths/<path>/<method>`, a JSON pointer to an operation, goes to that
//   operation's page. Any other fragment fails the build.
// Docusaurus resolves the links between guide pages (`./<page>.md#anchor`).
import { readFileSync } from 'node:fs';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

type RemarkApiReferenceLinksOptions = {
  // The JSON pointer → route map that scripts/generate-api-docs.mts writes.
  operationRoutesFile: string;
};

const SPEC_LINK = /^\.\.\/openapi\/openapi\.yaml(?:#(.*))?$/;

export default function remarkApiReferenceLinks({
  operationRoutesFile,
}: RemarkApiReferenceLinksOptions) {
  let routes: Record<string, string> | undefined;

  function operationRoute(fragment: string): string {
    routes ??= JSON.parse(readFileSync(operationRoutesFile, 'utf8')) as Record<string, string>;
    const route = routes[decodeURIComponent(fragment)];
    if (!route) {
      throw new Error(
        `The link ../openapi/openapi.yaml#${fragment} doesn't point at an operation. Use a JSON ` +
          `pointer such as #/paths/~1search/post. Operations: ${Object.keys(routes).join(', ')}`,
      );
    }
    return route;
  }

  return (tree: Root): void => {
    visit(tree, (node) => {
      if (node.type !== 'link' && node.type !== 'definition') {
        return;
      }
      const match = SPEC_LINK.exec(node.url);
      if (match) {
        node.url = match[1] ? operationRoute(match[1]) : '/api';
      }
    });
  };
}
