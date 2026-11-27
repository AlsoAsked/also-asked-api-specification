# AlsoAsked API specification and documentation

This repository is the source of the AlsoAsked API documentation:

- `src/`: the OpenAPI 3.1 source of API v1.1, split into files. `src/openapi.yaml` is the entry point.
- `openapi/openapi.yaml`: the bundled OpenAPI file. `npm run bundle` generates it, and the pre-commit hook bundles it
  for each commit. Don't edit it by hand.
- `openapi/openapi-v1.yaml`: the OpenAPI file of API v1. It has no source in `src/`. The AlsoAsked API uses it to check
  requests to API v1.
- `docs/`: the guide pages, in Markdown. `tools/navigation.json` sets their order.
- `style/`: the style guide (`style/README.md`) and the termbase (`style/termbase.yaml`). `npm run style` generates the
  Vale term rule, `docs/glossary.md`, and `llms.txt` from them.
- `site/`: the Docusaurus site that publishes the guides and the API reference.

## Commands

| Command | What it does |
| --- | --- |
| `npm run bundle` | Bundles `src/` into `openapi/openapi.yaml`. |
| `npm run style` | Regenerates the term rule, the glossary, and `llms.txt`. |
| `npm run lint` | Checks the generated files, the YAML, the OpenAPI file, the prose (Vale), and the links between the guides. |

The pre-commit hook runs `npm run lint` and `npm run bundle`.
