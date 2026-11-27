import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  toPublishedFullText,
  toPublishedIndex,
  toPublishedMarkdown,
  withAbsoluteLinks,
} from '../plugins/llm-markdown';
import { REPOSITORY, readRepositoryFile } from './helpers';

const SITE_URL = 'https://developers.example.com';
const FENCED_CODE = /^```[\s\S]*?^```/gm;

describe('toPublishedMarkdown', () => {
  it('removes the front matter', () => {
    const source = '---\ntitle: Quickstart\ntype: quickstart\n---\n# Quickstart\n\nText.\n';

    expect(toPublishedMarkdown(source)).toBe('# Quickstart\n\nText.\n');
  });

  it('removes HTML comments outside code blocks and keeps them inside', () => {
    const source = [
      '# Page',
      '',
      '<!-- PENDING: a hidden note -->',
      'Text <!-- inline --> here.',
      '',
      '```html',
      '<!-- a comment in an example -->',
      '```',
      '',
    ].join('\n');

    expect(toPublishedMarkdown(source)).toBe(
      '# Page\n\nText  here.\n\n```html\n<!-- a comment in an example -->\n```\n',
    );
  });

  it('collapses the blank lines that removed comments leave', () => {
    expect(toPublishedMarkdown('# Page\n\n<!-- one -->\n\n<!-- two -->\n\nText.')).toBe(
      '# Page\n\nText.\n',
    );
  });

  it('leaves no HTML comments outside code blocks in any guide page', () => {
    for (const page of readdirSync(join(REPOSITORY, 'docs')).filter((file) =>
      file.endsWith('.md'),
    )) {
      const published = toPublishedMarkdown(readRepositoryFile('docs', page));
      const prose = published.replace(FENCED_CODE, '');

      expect(prose, page).not.toContain('<!--');
      expect(published.startsWith('---'), page).toBe(false);
    }
  });
});

describe('withAbsoluteLinks', () => {
  const pageUrl = `${SITE_URL}/docs/quickstart.md`;

  it('resolves links to pages, anchors and the bundle against the page URL', () => {
    const markdown = [
      '[Sandbox](./sandbox.md#test-terms)',
      '[Below](#before-you-start)',
      '[OpenAPI](../openapi/openapi.yaml)',
    ].join('\n');

    expect(withAbsoluteLinks(markdown, pageUrl)).toBe(
      [
        `[Sandbox](${SITE_URL}/docs/sandbox.md#test-terms)`,
        `[Below](${SITE_URL}/docs/quickstart.md#before-you-start)`,
        `[OpenAPI](${SITE_URL}/openapi/openapi.yaml)`,
      ].join('\n'),
    );
  });

  it('keeps absolute URLs and email links', () => {
    const markdown =
      '[Pricing](https://alsoasked.com/pricing) [Email](mailto:support@alsoasked.com)';

    expect(withAbsoluteLinks(markdown, pageUrl)).toBe(markdown);
  });

  it('leaves links in code blocks unchanged', () => {
    const markdown = '```markdown\n[Sandbox](./sandbox.md)\n```';

    expect(withAbsoluteLinks(markdown, pageUrl)).toBe(markdown);
  });
});

describe('toPublishedIndex', () => {
  it('makes the page and bundle links absolute', () => {
    const source =
      '- [Quickstart](docs/quickstart.md): Start.\n- [OpenAPI](openapi/openapi.yaml): All.\n';

    expect(toPublishedIndex(source, SITE_URL)).toBe(
      `- [Quickstart](${SITE_URL}/docs/quickstart.md): Start.\n` +
        `- [OpenAPI](${SITE_URL}/openapi/openapi.yaml): All.\n`,
    );
  });

  it('fails on a relative link that the site does not publish', () => {
    expect(() => toPublishedIndex('- [Style](style/README.md)', SITE_URL)).toThrow(
      "llms.txt has a link that the site can't publish: style/README.md",
    );
  });

  it('publishes the repository llms.txt', () => {
    const index = toPublishedIndex(readRepositoryFile('llms.txt'), SITE_URL);

    expect(index).toContain(`(${SITE_URL}/docs/overview.md)`);
    expect(index).toContain(`(${SITE_URL}/openapi/openapi.yaml)`);
  });
});

describe('toPublishedFullText', () => {
  it('replaces each page line with its URL, and cleans and resolves each page', () => {
    const source = [
      '# docs/overview.md',
      '',
      '# Overview',
      '<!-- hidden -->',
      'See [Quickstart](./quickstart.md) and [below](#next).',
      '',
      '# docs/quickstart.md',
      '',
      '# Quickstart',
      'See [OpenAPI](../openapi/openapi.yaml).',
      '',
    ].join('\n');

    expect(toPublishedFullText(source, SITE_URL)).toBe(
      [
        `# ${SITE_URL}/docs/overview.md`,
        '',
        '# Overview',
        '',
        `See [Quickstart](${SITE_URL}/docs/quickstart.md) and [below](${SITE_URL}/docs/overview.md#next).`,
        '',
        `# ${SITE_URL}/docs/quickstart.md`,
        '',
        '# Quickstart',
        `See [OpenAPI](${SITE_URL}/openapi/openapi.yaml).`,
        '',
      ].join('\n'),
    );
  });

  it('fails when the text does not start with a page line', () => {
    expect(() => toPublishedFullText('# Overview\n', SITE_URL)).toThrow(
      'llms-full.txt doesn\'t start with a "# docs/<page>.md" line.',
    );
  });
});
