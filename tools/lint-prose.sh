#!/usr/bin/env bash

set -euo pipefail

# Lint the guide pages. Vale exits with an error when a rule at the error level fails.
vale --no-wrap docs/
