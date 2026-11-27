import type { Root, RootContent } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { describe, expect, it } from 'vitest';
import remarkGithubAlerts from '../../src/remark/github-alerts';

function transform(markdown: string): Root {
  const tree = fromMarkdown(markdown);
  remarkGithubAlerts()(tree);
  return tree;
}

// The node types and text of a tree, without positions.
function outline(node: Root | RootContent): unknown {
  if ('value' in node) {
    return { type: node.type, value: node.value };
  }
  const children = 'children' in node ? node.children.map(outline) : undefined;
  return node.type === 'containerDirective'
    ? { type: node.type, name: node.name, children }
    : { type: node.type, children };
}

describe('remarkGithubAlerts', () => {
  it.each([
    ['NOTE', 'note'],
    ['TIP', 'tip'],
    ['IMPORTANT', 'info'],
    ['WARNING', 'warning'],
    ['CAUTION', 'danger'],
  ])('renders [!%s] as the %s admonition', (marker, name) => {
    const tree = transform(`> [!${marker}]\n> Read this.`);

    expect(outline(tree)).toEqual({
      type: 'root',
      children: [
        {
          type: 'containerDirective',
          name,
          children: [{ type: 'paragraph', children: [{ type: 'text', value: 'Read this.' }] }],
        },
      ],
    });
  });

  it('keeps inline content and later paragraphs', () => {
    const tree = transform('> [!WARNING]\n> Use `async`.\n>\n> A second paragraph.');

    expect(outline(tree)).toEqual({
      type: 'root',
      children: [
        {
          type: 'containerDirective',
          name: 'warning',
          children: [
            {
              type: 'paragraph',
              children: [
                { type: 'text', value: 'Use ' },
                { type: 'inlineCode', value: 'async' },
                { type: 'text', value: '.' },
              ],
            },
            { type: 'paragraph', children: [{ type: 'text', value: 'A second paragraph.' }] },
          ],
        },
      ],
    });
  });

  it('renders an alert with no text as an empty admonition', () => {
    expect(outline(transform('> [!TIP]'))).toEqual({
      type: 'root',
      children: [{ type: 'containerDirective', name: 'tip', children: [] }],
    });
  });

  it('renders alerts inside lists', () => {
    const tree = transform('- Item\n\n  > [!NOTE]\n  > Nested.');

    expect(JSON.stringify(outline(tree))).toContain('"type":"containerDirective","name":"note"');
  });

  it('drops the hard line break after a marker', () => {
    const tree = transform('> [!NOTE]\\\n> After a hard break.');

    expect(outline(tree)).toEqual({
      type: 'root',
      children: [
        {
          type: 'containerDirective',
          name: 'note',
          children: [
            { type: 'paragraph', children: [{ type: 'text', value: 'After a hard break.' }] },
          ],
        },
      ],
    });
  });

  it.each([
    ['a plain blockquote', '> Just a quote.'],
    ['a blockquote that starts with a list', '> - [!NOTE] in a list'],
    ['an unknown alert type', '> [!DANGER]\n> Not a GitHub alert.'],
    ['a marker after other text', '> See [!NOTE] below.'],
  ])('leaves %s unchanged', (_case, markdown) => {
    expect(outline(transform(markdown))).toEqual(outline(fromMarkdown(markdown)));
  });
});
