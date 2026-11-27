// Writes the files for LLM readers into the build output:
// - /docs/<page>.md: the source of each guide page, without front matter or HTML comments. Its
//   relative links (./<page>.md, ../openapi/openapi.yaml) resolve against its own URL.
// - /llms.txt: the generated page index, with absolute links to the published Markdown.
// - /llms-full.txt: every guide page in one file, from `node tools/build-llms.mjs --full`. It's
//   cleaned like /docs/<page>.md, with absolute links, because relative links can't resolve from
//   the site root.
// - /openapi/openapi.yaml: the OpenAPI bundle. Its `../docs/<page>.md` links resolve to the
//   published Markdown.
import { execFile } from 'node:child_process';
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import type { LoadContext, Plugin } from '@docusaurus/types';
import { toPublishedFullText, toPublishedIndex, toPublishedMarkdown } from './llm-markdown';

const run = promisify(execFile);

export default function llmOutputs(context: LoadContext): Plugin {
  const root = join(context.siteDir, '..');
  const siteUrl = context.siteConfig.url.replace(/\/$/, '');

  async function writeGuidePages(outDir: string): Promise<void> {
    await mkdir(join(outDir, 'docs'), { recursive: true });
    const pages = (await readdir(join(root, 'docs'))).filter((file) => file.endsWith('.md'));
    await Promise.all(
      pages.map(async (page) => {
        const source = await readFile(join(root, 'docs', page), 'utf8');
        await writeFile(join(outDir, 'docs', page), toPublishedMarkdown(source));
      }),
    );
  }

  async function writeIndexes(outDir: string): Promise<void> {
    await run(process.execPath, ['tools/build-llms.mjs', '--full'], { cwd: root });
    const [index, fullText] = await Promise.all([
      readFile(join(root, 'llms.txt'), 'utf8'),
      readFile(join(root, 'llms-full.txt'), 'utf8'),
    ]);
    await Promise.all([
      writeFile(join(outDir, 'llms.txt'), toPublishedIndex(index, siteUrl)),
      writeFile(join(outDir, 'llms-full.txt'), toPublishedFullText(fullText, siteUrl)),
    ]);
  }

  async function writeBundle(outDir: string): Promise<void> {
    await mkdir(join(outDir, 'openapi'), { recursive: true });
    await copyFile(join(root, 'openapi', 'openapi.yaml'), join(outDir, 'openapi', 'openapi.yaml'));
  }

  return {
    name: 'llm-outputs',
    async postBuild({ outDir }) {
      await Promise.all([writeGuidePages(outDir), writeIndexes(outDir), writeBundle(outDir)]);
    },
  };
}
