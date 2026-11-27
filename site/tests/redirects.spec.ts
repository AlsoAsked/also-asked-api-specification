// Checks static/_redirects: the format and limits of Cloudflare Workers static assets redirects,
// that every target is a page the site publishes, and the rules for the old Stoplight URLs.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseDocument } from 'yaml';
import { operationRoutes } from '../scripts/lib/openapi-copy.mts';
import { REPOSITORY, readRepositoryFile, SITE } from './helpers';

type Rule = { line: number; source: string; target: string; status: string; fields: number };

const STOPLIGHT_ID = /^\/docs\/also-asked\/([0-9a-z]{13})(-\*)?$/;
const STATIC_LIMIT = 2000;
const DYNAMIC_LIMIT = 100;

const rules: Rule[] = readFileSync(join(SITE, 'static', '_redirects'), 'utf8')
  .split('\n')
  .map((text, index) => ({ text: text.trim(), line: index + 1 }))
  .filter(({ text }) => text !== '' && !text.startsWith('#'))
  .map(({ text, line }) => {
    const fields = text.split(/\s+/);
    return {
      line,
      source: fields[0] ?? '',
      target: fields[1] ?? '',
      status: fields[2] ?? '',
      fields: fields.length,
    };
  });

const isDynamic = (rule: Rule): boolean => rule.source.includes('*') || rule.source.includes('/:');

const apiRoutes = new Set([
  '/api',
  ...Object.values(
    operationRoutes(parseDocument(readRepositoryFile('openapi', 'openapi.yaml')), () => true),
  ),
]);

function isPublishedPage(target: string): boolean {
  const guide = /^\/docs\/([a-z0-9-]+)$/.exec(target);
  if (guide?.[1]) {
    return existsSync(join(REPOSITORY, 'docs', `${guide[1]}.md`));
  }
  return apiRoutes.has(target);
}

describe('static/_redirects', () => {
  it('has a source, a target and a 301 status in every rule', () => {
    for (const rule of rules) {
      expect(rule.fields, `line ${rule.line}`).toBe(3);
      expect(rule.source, `line ${rule.line}`).toMatch(/^\//);
      expect(rule.status, `line ${rule.line}`).toBe('301');
    }
  });

  it('has each source once', () => {
    const sources = rules.map((rule) => rule.source);

    expect(new Set(sources).size).toBe(sources.length);
  });

  it('stays within the static and dynamic rule limits', () => {
    const dynamic = rules.filter(isDynamic).length;

    expect(dynamic).toBeLessThanOrEqual(DYNAMIC_LIMIT);
    expect(rules.length - dynamic).toBeLessThanOrEqual(STATIC_LIMIT);
  });

  it('redirects only to pages that the site publishes', () => {
    for (const rule of rules) {
      if (rule.target === '/docs/also-asked/:splat') {
        continue;
      }

      expect(isPublishedPage(rule.target), `line ${rule.line}: ${rule.target}`).toBe(true);
    }
  });

  it('redirects each old Stoplight ID with and without its slug, to the same page', () => {
    const targets = new Map<string, { bare?: string; slug?: string }>();
    for (const rule of rules) {
      const match = STOPLIGHT_ID.exec(rule.source);
      if (match?.[1]) {
        const entry = targets.get(match[1]) ?? {};
        entry[match[2] ? 'slug' : 'bare'] = rule.target;
        targets.set(match[1], entry);
      }
    }

    expect(targets.size).toBeGreaterThan(0);
    for (const [id, { bare, slug }] of targets) {
      expect(bare, id).toBeDefined();
      expect(slug, id).toBe(bare);
    }
  });

  it('sends old branch URLs to the same rules', () => {
    const branch = rules.find((rule) => rule.source === '/docs/also-asked/branches/main/*');

    expect(branch?.target).toBe('/docs/also-asked/:splat');
    expect(rules.indexOf(branch as Rule)).toBeLessThan(
      rules.findIndex((rule) => STOPLIGHT_ID.test(rule.source)),
    );
  });

  it('ends with the catch-all for old Stoplight URLs', () => {
    expect(rules.at(-1)).toMatchObject({ source: '/docs/also-asked/*', target: '/docs/overview' });
  });
});
