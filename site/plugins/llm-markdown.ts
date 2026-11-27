// Turns the repository's Markdown into the files that the site publishes for LLM readers
// (plugins/llm-outputs.ts).

const FRONT_MATTER = /^---\n[\s\S]*?\n---\n/;
const FENCE = /(^```[\s\S]*?^```)/gm;
const COMMENT = /<!--[\s\S]*?-->/g;
const LINK = /\]\(([^)\s]+)\)/g;
const ABSOLUTE_URL = /^[a-z][a-z0-9+.-]*:/i;
const FULL_TEXT_PAGE = /^# (docs\/[a-z0-9-]+\.md)$/m;

// Applies a change to the Markdown outside fenced code blocks.
function outsideCode(markdown: string, change: (text: string) => string): string {
  return markdown
    .split(FENCE)
    .map((part, index) => (index % 2 === 1 ? part : change(part)))
    .join('');
}

// Removes the front matter and the HTML comments outside code blocks.
export function toPublishedMarkdown(source: string): string {
  const text = outsideCode(source.replace(FRONT_MATTER, ''), (part) => part.replace(COMMENT, ''));
  return `${text.replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

// Resolves the relative links outside code blocks against the page's published URL.
export function withAbsoluteLinks(markdown: string, pageUrl: string): string {
  return outsideCode(markdown, (part) =>
    part.replace(LINK, (match, target: string) =>
      ABSOLUTE_URL.test(target) ? match : `](${new URL(target, pageUrl).href})`,
    ),
  );
}

// Makes the llms.txt links absolute. Links in llms.txt are relative to the repository root.
export function toPublishedIndex(source: string, siteUrl: string): string {
  const index = source
    .replace(/\]\(docs\/([a-z0-9-]+\.md)\)/g, `](${siteUrl}/docs/$1)`)
    .replace(/\]\(openapi\/openapi\.yaml\)/g, `](${siteUrl}/openapi/openapi.yaml)`);
  const relative = /\]\(((?!https?:)[^)]+)\)/.exec(index);
  if (relative) {
    throw new Error(`llms.txt has a link that the site can't publish: ${relative[1]}`);
  }
  return index;
}

// Cleans each page in llms-full.txt, which has a "# docs/<page>.md" line before each page, and
// replaces that line with the page's published URL.
export function toPublishedFullText(source: string, siteUrl: string): string {
  const [before, ...pages] = source.split(FULL_TEXT_PAGE);
  if (before?.trim() !== '' || pages.length === 0) {
    throw new Error('llms-full.txt doesn\'t start with a "# docs/<page>.md" line.');
  }
  const published: string[] = [];
  for (let index = 0; index < pages.length; index += 2) {
    const pageUrl = `${siteUrl}/${pages[index]}`;
    const text = withAbsoluteLinks(toPublishedMarkdown(pages[index + 1] ?? ''), pageUrl);
    published.push(`# ${pageUrl}\n\n${text}`);
  }
  return published.join('\n');
}
