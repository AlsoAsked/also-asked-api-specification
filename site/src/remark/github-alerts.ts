// Renders GitHub alerts (`> [!NOTE]`, `> [!WARNING]` and the others) as Docusaurus admonitions.
// No page uses them yet, but the style guide allows them. The plugin replaces the blockquote with
// the container directive that `:::note` produces, so it must run before the default remark
// plugins, where Docusaurus' admonitions plugin renders the directive.
import type { Blockquote, Root } from 'mdast';
import type { ContainerDirective } from 'mdast-util-directive';
import { SKIP, visit } from 'unist-util-visit';

const ADMONITIONS = {
  NOTE: 'note',
  TIP: 'tip',
  IMPORTANT: 'info',
  WARNING: 'warning',
  CAUTION: 'danger',
} as const;

const MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(?:\r?\n)?/;

// Returns the admonition for a blockquote that starts with an alert marker, and removes the marker.
function toAdmonition(blockquote: Blockquote): ContainerDirective | undefined {
  const [paragraph] = blockquote.children;
  if (paragraph?.type !== 'paragraph') {
    return undefined;
  }
  const [text] = paragraph.children;
  const match = text?.type === 'text' ? MARKER.exec(text.value) : null;
  const kind = match?.[1] as keyof typeof ADMONITIONS | undefined;
  if (!(text?.type === 'text' && match && kind)) {
    return undefined;
  }

  text.value = text.value.slice(match[0].length);
  if (text.value === '') {
    paragraph.children.shift();
    if (paragraph.children[0]?.type === 'break') {
      paragraph.children.shift();
    }
  }
  const children =
    paragraph.children.length > 0 ? blockquote.children : blockquote.children.slice(1);

  return {
    type: 'containerDirective',
    name: ADMONITIONS[kind],
    attributes: {},
    children,
  };
}

export default function remarkGithubAlerts() {
  return (tree: Root): void => {
    visit(tree, 'blockquote', (node, index, parent) => {
      const admonition = toAdmonition(node);
      if (admonition && parent && index !== undefined) {
        parent.children[index] = admonition;
        return SKIP;
      }
      return undefined;
    });
  };
}
