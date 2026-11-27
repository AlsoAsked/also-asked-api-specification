// The guide navigation comes from ../tools/navigation.json, which tools/build-llms.mjs also uses
// for llms.txt, so the site and llms.txt list the same pages in the same order. Page labels are
// the front matter titles.
import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
import navigation from '../tools/navigation.json';

const sidebars: SidebarsConfig = {
  guides: navigation.map(({ section, pages }) => ({
    type: 'category' as const,
    label: section,
    collapsed: false,
    items: pages,
  })),
};

export default sidebars;
