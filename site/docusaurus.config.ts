import { join } from 'node:path';
import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import type * as OpenApiPlugin from 'docusaurus-plugin-openapi-docs';
import { themes as prismThemes } from 'prism-react-renderer';
import remarkApiReferenceLinks from './src/remark/api-reference-links';
import remarkGithubAlerts from './src/remark/github-alerts';

const SITE_URL = 'https://developers.alsoasked.com';

// Written by scripts/generate-api-docs.mts before each build.
const OPERATION_ROUTES_FILE = join(__dirname, '.generated', 'operation-routes.json');

const config: Config = {
  title: 'AlsoAsked API',
  tagline: 'Get the "People Also Ask" questions that Google shows for a term.',
  // Square icons and the social card are copies of the ones in also-asked-frontend/public.
  favicon: 'img/favicon.ico',
  headTags: [
    {
      tagName: 'link',
      attributes: { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/img/icon-192.png' },
    },
    { tagName: 'link', attributes: { rel: 'apple-touch-icon', href: '/img/icon-192.png' } },
  ],
  url: SITE_URL,
  baseUrl: '/',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onDuplicateRoutes: 'throw',
  markdown: {
    // Parse .md files as CommonMark, not MDX, so the guide pages render as they are on GitHub.
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'throw',
      onBrokenMarkdownImages: 'throw',
    },
  },
  future: {
    v4: true,
    faster: true,
  },
  // The repository's assets folder is served at the site root, for example /images/logo-blue.png.
  staticDirectories: ['static', '../assets'],
  presets: [
    [
      'classic',
      {
        docs: {
          path: '../docs',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          beforeDefaultRemarkPlugins: [
            [remarkApiReferenceLinks, { operationRoutesFile: OPERATION_ROUTES_FILE }],
            remarkGithubAlerts,
          ],
          // From the Git history, so CI needs a full clone (fetch-depth: 0). The sitemap uses the
          // same dates for lastmod.
          showLastUpdateTime: true,
        },
        blog: false,
        pages: false,
        sitemap: {
          lastmod: 'date',
          ignorePatterns: ['/search'],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'api',
        path: 'api',
        routeBasePath: 'api',
        sidebarPath: './sidebars-api.ts',
        docItemComponent: '@theme/ApiItem',
        beforeDefaultRemarkPlugins: [remarkGithubAlerts],
      },
    ],
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'openapi',
        docsPluginId: 'api',
        config: {
          alsoasked: {
            // A copy of ../openapi/openapi.yaml, made by scripts/generate-api-docs.mts.
            specPath: '.generated/openapi.yaml',
            outputDir: 'api',
            downloadUrl: '/openapi/openapi.yaml',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
          } satisfies OpenApiPlugin.Options,
        },
      },
    ],
    './plugins/llm-outputs.ts',
  ],
  themes: [
    'docusaurus-theme-openapi-docs',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexBlog: false,
        indexPages: false,
        docsRouteBasePath: ['docs', 'api'],
        docsDir: ['../docs', 'api'],
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],
  themeConfig: {
    image: 'img/social-card.png',
    navbar: {
      // The logo is the AlsoAsked wordmark.
      title: 'API',
      logo: {
        alt: 'AlsoAsked',
        src: 'images/logo-blue.png',
        href: '/docs/overview',
      },
      items: [
        { type: 'docSidebar', sidebarId: 'guides', label: 'Guides', position: 'left' },
        {
          type: 'docSidebar',
          sidebarId: 'api',
          docsPluginId: 'api',
          label: 'API reference',
          position: 'left',
        },
        { type: 'search', position: 'right' },
        { href: 'https://alsoasked.com', label: 'AlsoAsked', position: 'right' },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Quickstart', to: '/docs/quickstart' },
            { label: 'API reference', to: '/api' },
            { label: 'Changelog', to: '/docs/changelog' },
          ],
        },
        {
          title: 'AlsoAsked',
          items: [
            { label: 'alsoasked.com', href: 'https://alsoasked.com' },
            { label: 'Pricing', href: 'https://alsoasked.com/pricing' },
            { label: 'Help center', href: 'https://help.alsoasked.com' },
          ],
        },
        {
          title: 'Support',
          items: [
            { label: 'support@alsoasked.com', href: 'mailto:support@alsoasked.com' },
            { label: 'Terms of use', href: 'https://alsoasked.com/eula' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} AlsoAsked`,
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'http', 'php', 'python'],
    },
    languageTabs: [
      { highlight: 'bash', language: 'curl', logoClass: 'curl' },
      { highlight: 'python', language: 'python', logoClass: 'python' },
      { highlight: 'javascript', language: 'nodejs', logoClass: 'nodejs' },
      { highlight: 'php', language: 'php', logoClass: 'php' },
    ],
  } satisfies Preset.ThemeConfig,
};

export default config;
