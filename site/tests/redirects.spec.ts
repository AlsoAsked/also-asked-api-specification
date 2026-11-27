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
  });

  // Cloudflare keeps the rules keyed by source, not in file order, so with overlapping rules a
  // catch-all can win over a specific rule (it did at cutover). wrangler dev keeps the file order.
  it('has no two rules that can match the same path', () => {
    for (const [index, rule] of rules.entries()) {
      for (const other of rules.slice(index + 1)) {
        expect(canOverlap(rule, other), `line ${rule.line} and line ${other.line}`).toBe(false);
      }
    }
  });

  it('detects overlapping rules', () => {
    const rule = (source: string): Rule => ({ line: 0, source, target: '', status: '', fields: 3 });

    expect(canOverlap(rule('/docs/also-asked/*'), rule('/docs/also-asked/abc'))).toBe(true);
    expect(canOverlap(rule('/docs/also-asked/abc-*'), rule('/docs/also-asked/*'))).toBe(true);
    expect(canOverlap(rule('/docs/also-asked/abc-*'), rule('/docs/also-asked/abc'))).toBe(false);
    expect(canOverlap(rule('/docs/also-asked/abc-*'), rule('/docs/also-asked/abd-*'))).toBe(false);
  });
});

// The part of a source before its first splat or placeholder.
function literalPrefix(rule: Rule): string {
  const end = rule.source.search(/\*|\/:/);
  return end === -1 ? rule.source : rule.source.slice(0, end + (rule.source[end] === '/' ? 1 : 0));
}

// Whether some path could match both rules. A static source matches only itself, and a dynamic
// source matches paths that start with its literal prefix.
function canOverlap(a: Rule, b: Rule): boolean {
  if (!isDynamic(a) && !isDynamic(b)) {
    return a.source === b.source;
  }
  if (!isDynamic(a)) {
    return a.source.startsWith(literalPrefix(b));
  }
  if (!isDynamic(b)) {
    return b.source.startsWith(literalPrefix(a));
  }
  const [prefixA, prefixB] = [literalPrefix(a), literalPrefix(b)];
  return prefixA.startsWith(prefixB) || prefixB.startsWith(prefixA);
}
