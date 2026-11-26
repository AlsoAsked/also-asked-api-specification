#!/usr/bin/env bash

# Fails while any PENDING marker remains. Run this before the docs are published.
# Markers are HTML comments in docs/ and YAML comments in src/ and style/termbase.yaml.

set -uo pipefail

if grep -rn "PENDING" docs/ src/ style/termbase.yaml; then
  echo "Unresolved PENDING markers. Resolve them before you publish the docs." >&2
  exit 1
fi

echo "No PENDING markers."
