#!/usr/bin/env node
// Checks the guide pages against the bundled specification:
// - every relative link and #anchor in docs/*.md and in the OpenAPI text resolves;
// - every JSON body sent to POST /search in a curl example is valid against the request schema.
// Run after npm run bundle.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parse } from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';

const errors = [];
const docs = readdirSync('docs').filter((file) => file.endsWith('.md')).map((file) => join('docs', file));
const withoutCode = (text) => text.replace(/```[\s\S]*?```/g, '');

// GitHub-style heading anchors.
const slug = (heading) => heading.trim().toLowerCase().replace(/`/g, '').replace(/[^\w\- ]/g, '').replace(/ /g, '-');
const anchors = new Map(docs.map((file) => [
  resolve(file),
  new Set([...withoutCode(readFileSync(file, 'utf8')).matchAll(/^#{1,6} (.+)$/gm)].map((match) => slug(match[1]))),
]));

function checkLink(source, base, link) {
  if (/^(https?:|mailto:)/.test(link)) return;
  const [path, anchor] = link.split('#');
  const target = path ? resolve(base, path) : resolve(source);
  if (!existsSync(target)) {
    errors.push(`${source}: the link target doesn't exist: ${link}`);
  } else if (anchor && anchors.has(target) && !anchors.get(target).has(anchor)) {
    errors.push(`${source}: the anchor doesn't exist: ${link}`);
  }
}

for (const file of docs) {
  for (const match of withoutCode(readFileSync(file, 'utf8')).matchAll(/\]\(([^)\s]+)\)/g)) {
    checkLink(file, dirname(file), match[1]);
  }
}

// Links in the OpenAPI text resolve from the bundle in openapi/.
const sources = readdirSync('src', { recursive: true }).filter((file) => file.endsWith('.yaml')).map((file) => join('src', file));
for (const file of sources) {
  for (const match of readFileSync(file, 'utf8').matchAll(/\]\(([^)\s]+)\)/g)) {
    checkLink(file, 'openapi', match[1]);
  }
}

// Request bodies in curl examples.
const spec = parse(readFileSync('openapi/openapi.yaml', 'utf8'));
const ajv = new Ajv2020({ strict: false, allErrors: true, logger: false });
ajv.addSchema({ $id: 'spec', components: spec.components });
const validate = ajv.compile({ $ref: 'spec#/components/schemas/SearchRequestOptions' });
let bodies = 0;

for (const file of docs) {
  for (const match of readFileSync(file, 'utf8').matchAll(/curl[^`]*?--request POST '[^']*\/search'[^`]*?--data '([\s\S]*?)'/g)) {
    bodies++;
    let body;
    try {
      body = JSON.parse(match[1]);
    } catch (error) {
      errors.push(`${file}: a request body isn't valid JSON: ${error.message}`);
      continue;
    }
    if (!validate(body)) errors.push(`${file}: a request body doesn't match the schema: ${ajv.errorsText(validate.errors)}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Links and anchors resolve. ${bodies} request bodies match the schema.`);
