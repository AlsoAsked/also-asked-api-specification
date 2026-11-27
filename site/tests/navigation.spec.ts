import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import navigation from '../../tools/navigation.json';
import { REPOSITORY } from './helpers';

describe('tools/navigation.json', () => {
  // tools/build-llms.mjs fails on a listed page that doesn't exist, but not on a page that isn't
  // listed. An unlisted page would build, but it wouldn't be in the sidebar or llms.txt.
  it('lists every guide page exactly once', () => {
    const listed = navigation.flatMap(({ pages }) => pages);
    const pages = readdirSync(join(REPOSITORY, 'docs'))
      .filter((file) => file.endsWith('.md'))
      .map((file) => file.replace(/\.md$/, ''));

    expect([...listed].sort()).toEqual([...pages].sort());
  });
});
