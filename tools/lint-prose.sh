#!/usr/bin/env bash

set -euo pipefail

# Lint the guide pages and the reader-facing text in the OpenAPI source (description, title and summary fields).
# Vale exits with an error when a rule at the error level fails.
vale --no-wrap docs/ src/
