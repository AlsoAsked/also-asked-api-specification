// Generates the API reference pages (api/) from the OpenAPI bundle (../openapi/openapi.yaml).
//
// The pages are generated from a copy of the bundle (.generated/openapi.yaml) with two changes.
// The theme renders schema descriptions in the browser, so the changes must be in the copy, not in
// a remark plugin:
// - Links to guide pages (`../docs/<page>.md#anchor`, relative to openapi/) point at the guide page
//   routes. The bundle published at /openapi/openapi.yaml keeps the original links, which resolve
//   to the Markdown pages.
// - The sandbox server is first, so "Send API request" and the code samples use the sandbox API
//   until the reader chooses another server. The theme uses the first server by default.
//
// It also writes .generated/operation-routes.json, which maps the JSON pointer of each operation
// (for example /paths/~1search/post) to its page, for src/remark/api-reference-links.ts.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';
import {
  operationRoutes,
  putSandboxServerFirst,
  rewriteGuideLinks,
  withIntroductionAtRoot,
  withIntroductionInfoPath,
} from './lib/openapi-copy.mts';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..');
const BUNDLE = join(SITE, '..', 'openapi', 'openapi.yaml');
const GENERATED = join(SITE, '.generated');
const OUTPUT = join(SITE, 'api');

function updatePage(file: string, change: (page: string) => string): void {
  const path = join(OUTPUT, file);
  writeFileSync(path, change(readFileSync(path, 'utf8')));
}

const { text, count: links } = rewriteGuideLinks(readFileSync(BUNDLE, 'utf8'));
const document = parseDocument(text);
putSandboxServerFirst(document);
mkdirSync(GENERATED, { recursive: true });
writeFileSync(join(GENERATED, 'openapi.yaml'), document.toString({ lineWidth: 0 }));

rmSync(OUTPUT, { recursive: true, force: true });
mkdirSync(OUTPUT, { recursive: true });
const docusaurus = join(SITE, 'node_modules', '.bin', 'docusaurus');
execFileSync(docusaurus, ['gen-api-docs', 'all'], { cwd: SITE, stdio: 'inherit' });

updatePage('alsoasked-api.info.mdx', withIntroductionAtRoot);
const operations = readdirSync(OUTPUT).filter((file) => file.endsWith('.api.mdx'));
for (const file of operations) {
  updatePage(file, withIntroductionInfoPath);
}

const routes = operationRoutes(document, (id) => existsSync(join(OUTPUT, `${id}.api.mdx`)));
writeFileSync(join(GENERATED, 'operation-routes.json'), `${JSON.stringify(routes, null, 2)}\n`);

console.log(
  `API reference generated: ${operations.length} operation pages, ${links} links to guide pages ` +
    'rewritten, sandbox server first.',
);
