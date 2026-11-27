// Runs the plugin's postBuild step against the repository content, into a temporary folder. Like
// the build, it runs tools/build-llms.mjs, which rewrites llms.txt (unchanged while it's current)
// and writes llms-full.txt (not committed) in the repository root.
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { LoadContext, Plugin } from '@docusaurus/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import llmOutputs from '../plugins/llm-outputs';
import { REPOSITORY, readRepositoryFile, SITE } from './helpers';

type PostBuildProperties = Parameters<NonNullable<Plugin['postBuild']>>[0];

const SITE_URL = 'https://developers.example.com';

let outDir: string;

const read = (...path: string[]): string => readFileSync(join(outDir, ...path), 'utf8');

beforeAll(async () => {
  outDir = mkdtempSync(join(tmpdir(), 'llm-outputs-'));
  const context = { siteDir: SITE, siteConfig: { url: `${SITE_URL}/` } } as LoadContext;
  const plugin = llmOutputs(context);
  // The plugin reads only outDir from the postBuild properties.
  await plugin.postBuild?.({ outDir } as PostBuildProperties);
}, 30_000);

afterAll(() => {
  rmSync(outDir, { recursive: true, force: true });
});

describe('llmOutputs', () => {
  it('writes a Markdown file for every guide page', () => {
    const pages = readdirSync(join(REPOSITORY, 'docs')).filter((file) => file.endsWith('.md'));

    expect(readdirSync(join(outDir, 'docs')).sort()).toEqual(pages.sort());
    expect(read('docs', 'quickstart.md')).toMatch(/^# Quickstart\n/);
  });

  it('writes llms.txt with absolute links and no trailing slash in the site URL', () => {
    const index = read('llms.txt');

    expect(index).toContain(`](${SITE_URL}/docs/quickstart.md)`);
    expect(index).not.toContain(`${SITE_URL}//`);
  });

  it('writes llms-full.txt with a URL line for each page', () => {
    const fullText = read('llms-full.txt');

    expect(fullText.startsWith(`# ${SITE_URL}/docs/overview.md\n`)).toBe(true);
    expect(fullText).not.toContain('<!--');
    expect(fullText).not.toMatch(/\]\(\.\.?\//);
  });

  it('copies the OpenAPI bundle unchanged', () => {
    expect(existsSync(join(outDir, 'openapi', 'openapi.yaml'))).toBe(true);
    expect(read('openapi', 'openapi.yaml')).toBe(readRepositoryFile('openapi', 'openapi.yaml'));
  });
});
