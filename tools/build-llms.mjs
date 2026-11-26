#!/usr/bin/env node
// Generates llms.txt (the page index for LLM readers and the navigation order) from the front matter of docs/*.md.
// With --full, also writes llms-full.txt (every page in one file), which is a build output and is not committed.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { parse } from 'yaml';

// Navigation order. Each page must exist and have title, description and type in its front matter.
const SECTIONS = [
  ['Start here', ['overview', 'quickstart', 'authentication', 'sandbox']],
  ['Searches', ['searches', 'perform-a-search', 'search-results', 'search-history', 'credits', 'bulk-searches']],
  ['Webhooks', ['webhooks', 'verify-webhook-signatures']],
  ['Reference', ['account', 'errors', 'rate-limits', 'glossary', 'changelog']],
];

function page(name) {
  const path = `docs/${name}.md`;
  if (!existsSync(path)) throw new Error(`${path} is in the navigation but does not exist.`);
  const text = readFileSync(path, 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error(`${path} has no front matter.`);
  const meta = parse(match[1]);
  for (const key of ['title', 'description', 'type']) {
    if (!meta[key]) throw new Error(`${path} has no "${key}" in its front matter.`);
  }
  return { path, text: text.slice(match[0].length), ...meta };
}

const pages = SECTIONS.map(([section, names]) => [section, names.map(page)]);

const lines = [
  '# AlsoAsked API',
  '',
  '> The AlsoAsked API gets the "People Also Ask" questions that Google shows for a term, with their answers and child'
    + ' results. Version v1.1. Live API: https://alsoaskedapi.com/v1.1 (Pro plan). Sandbox API:'
    + ' https://sandbox.alsoaskedapi.com/v1.1 (any account). Send an API key in the X-Api-Key header.',
  '',
  'Each page is Markdown. Each section of a page is written to be correct on its own.',
  '',
  ...pages.flatMap(([section, list]) => [
    `## ${section}`,
    '',
    ...list.map((p) => `- [${p.title}](${p.path}): ${p.description}`),
    '',
  ]),
  '## OpenAPI',
  '',
  '- [OpenAPI specification](openapi/openapi.yaml): every endpoint, field, and response of the AlsoAsked API, version v1.1.',
  '',
];
writeFileSync('llms.txt', lines.join('\n'));

if (process.argv.includes('--full')) {
  const full = pages.flatMap(([, list]) => list).map((p) => `# ${p.path}\n\n${p.text.trim()}\n`).join('\n');
  writeFileSync('llms-full.txt', full);
}

console.log(`llms.txt: ${pages.reduce((n, [, list]) => n + list.length, 0)} pages.`);
