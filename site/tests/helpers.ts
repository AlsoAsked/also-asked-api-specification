import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// The root of the specification repository, which holds docs/, openapi/ and tools/.
export const REPOSITORY = join(import.meta.dirname, '..', '..');

// The site folder (site/).
export const SITE = join(import.meta.dirname, '..');

export function readRepositoryFile(...path: string[]): string {
  return readFileSync(join(REPOSITORY, ...path), 'utf8');
}
