#!/usr/bin/env bash

set -euo pipefail

redocly bundle --output openapi/openapi.yaml src/openapi.yaml
sed -i '1s/^/# DO NOT EDIT THIS FILE!\n# This file is machine-generated from ..\/src\/openapi\.yaml\n/' openapi/openapi.yaml
