# AlsoAsked developer docs site

The site at `developers.alsoasked.com`. It publishes the guide pages in `../docs/` and the API reference from
`../openapi/openapi.yaml` with [Docusaurus](https://docusaurus.io/) and the
[openapi-docs](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs) plugin. It's deployed as a Cloudflare Worker
with static assets only.

The site doesn't change the content. Edit the pages and the OpenAPI source in the repository root, as before.

## Commands

Use Node 22 (`nvm use` in this folder) and pnpm. Install the dependencies in the repository root too, because the build
runs `../tools/build-llms.mjs`.

```bash
pnpm install                # in the repository root and in site/
pnpm start                  # development server
pnpm build                  # static site in build/
pnpm build:release          # npm run lint and npm run check:release in the root, then the build
pnpm preview                # serves build/ with wrangler, including _redirects and _headers
pnpm lint                   # Biome (lint, format and import order), then tsc
pnpm lint:fix               # Biome with safe fixes and formatting applied
pnpm check:deps             # knip: unused files, exports and dependencies
pnpm test                   # Vitest
pnpm test:coverage          # Vitest with a coverage report
```

`pnpm build` first runs `scripts/generate-api-docs.mts`, which writes the API reference pages to `api/` from a copy of
the bundle in `.generated/`. Both folders are generated and aren't committed. Restart `pnpm preview` after a build,
because wrangler doesn't pick up a replaced `build/` folder.

## Code quality

The tooling follows `also-asked-frontend`:

- **Biome** (`biome.json`) lints, formats and sorts imports in the TypeScript, CSS and JSON files. The rule set is the
  frontend's, plus `type` over `interface`, `import type`, no unused imports and no non-null assertions. Formatting:
  2 spaces, LF, 100 columns, single quotes, trailing commas.
- **TypeScript** (`tsconfig.json`) runs in strict mode with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `verbatimModuleSyntax` and `erasableSyntaxOnly`. Scripts are TypeScript (`.mts`) that Node runs directly.
  `pnpm lint:tsc` generates the API pages first, because `sidebars-api.ts` imports the generated sidebar.
- **knip** (`knip.json`) fails on unused files, exports and dependencies.
- **Vitest** (`vitest.config.mts`, tests in `tests/`) covers:
  - the Markdown and llms files for LLM readers (`plugins/`);
  - the changes to the bundle copy and the generated pages (`scripts/lib/openapi-copy.mts`);
  - both remark plugins;
  - `static/_redirects`: format, limits, targets that exist and the Stoplight ID rules;
  - that `tools/navigation.json` lists every guide page.

  The build steps that need Docusaurus (`scripts/generate-api-docs.mts` and the page rendering) are checked by the
  build itself, which fails on broken links and anchors.
- **Pre-commit:** when a commit changes `site/`, the repository's Husky hook runs lint-staged (Biome with fixes on the
  staged files) and knip. CI runs `pnpm lint`, `pnpm check:deps` and `pnpm test` on every pull request.

## What the site publishes

| URL | Source |
| --- | --- |
| `/docs/<page>` | `../docs/<page>.md`. The navigation order is `../tools/navigation.json`, which `llms.txt` also uses. |
| `/docs/<page>.md` | The same page as Markdown, without front matter or HTML comments (`plugins/llm-outputs.ts`) |
| `/api`, `/api/<operation>` | `../openapi/openapi.yaml` |
| `/openapi/openapi.yaml` | The bundle, unchanged |
| `/llms.txt` | `../llms.txt`, with absolute links |
| `/llms-full.txt` | `node tools/build-llms.mjs --full`, cleaned like `/docs/<page>.md` and with absolute links |
| `/images/*` | `../assets/images/*` |
| `/img/*` | `static/img/`: the favicon, square icons and the 1200×630 social card, copied from `also-asked-frontend/public` |
| `/robots.txt`, `/sitemap.xml` | `static/robots.txt`, and the sitemap that Docusaurus generates |

## Links

- `./<page>.md#anchor` links between guide pages are resolved by Docusaurus. A broken link or anchor fails the build.
- `../openapi/openapi.yaml` links in the guide pages go to `/api` (`src/remark/api-reference-links.ts`).
- `../openapi/openapi.yaml#/paths/~1search/post` (a JSON pointer to an operation) goes to that operation's page. The
  pointer is the standard way to address part of an OpenAPI document, so the link doesn't depend on this site. A
  pointer that isn't an operation fails the build.
- `../docs/<page>.md` links in the OpenAPI descriptions go to `/docs/<page>` in the rendered reference
  (`scripts/generate-api-docs.mts`). The published bundle keeps the original links, which resolve to the Markdown pages.
- GitHub alerts (`> [!NOTE]`) render as admonitions (`src/remark/github-alerts.ts`). No page uses them yet, but the
  style guide allows them.

## Try it out

The copy of the bundle that the reference is generated from lists the sandbox server first, so "Send API request" and
the code samples use the sandbox API until the reader chooses another server. The browser sends the request straight to
the API, which allows cross-origin requests. If the reader enters no key, the theme sends its placeholder
(`<X-Api-Key>`), so the API returns `403 invalid_api_key` rather than `401 missing_api_key`.

## Deployment

`.github/workflows/developer-docs.yml` builds pull requests and pushes to `main` on RunsOn runners, as in
`also-asked-web` and `also-asked-frontend`, and deploys the head of `main` with `wrangler deploy`. The deploy job needs
the `developer-docs` environment with the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets. The token is an
account API token with the Editor role on the `also-asked-developer-docs` Worker only, and Workers Routes Write on the
`alsoasked.com` zone, which a deploy needs only when it adds or changes the route.

This repository is public, so only collaborators can open pull requests, and a run for anyone else's pull request waits
for approval. Keep it that way while the workflow runs on RunsOn: a pull request's code runs on the runner.

`wrangler.jsonc` serves the site on the route `developers.alsoasked.com/*`, not as a custom domain. The `developers`
record in the `alsoasked.com` zone is a proxied CNAME to Stoplight, so the Worker answers first. To roll back to
Stoplight while that record exists, delete the route in the Cloudflare dashboard. There's no `workers.dev` URL.

Redirects are in `static/_redirects`, and response headers in `static/_headers`. The old Stoplight URLs redirect in
three forms: `/docs/also-asked/<id>-<slug>`, `/docs/also-asked/<id>`, and both under `/docs/also-asked/branches/main/`.
The IDs are the 31 pages in the Stoplight sidebar on 2026-11-26.

## After cutover

- Update the links to old anchors: `SigningKey.tsx`, `GeneratedKeyModal.tsx` and `CreateKeyModal.tsx` in
  `also-asked-frontend`, and the README of the PHP SDK.
- Check Search Console for old URLs that get traffic and aren't in `static/_redirects`.
- Remove the custom domain in Stoplight. The route keeps serving the site.
- Remove the `announcementBar` from `docusaurus.config.ts` a few months after the move.
