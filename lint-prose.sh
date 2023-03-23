#!/usr/bin/env bash

function cleanup {
  rm -f "$markdown_file" "$markdown_file"
}

set -euo pipefail

# convert the OpenAPI spec to markdown
markdown=$(
  npm exec -- widdershins \
    --resolve \
    --user_templates widdershins/openapi3/ \
    --omitBody \
    --omitHeader \
    --summary openapi/openapi.yaml | \
  sed -n '/Compiling main.dot to function/,$p' | \
  sed -n '1,/Compiling servers.dot to function/d; p'
)

markdown_file=$(mktemp)
echo "$markdown" > "$markdown_file"
trap cleanup EXIT

# render the markdown with ANSI escape codes
rendered_file=$(mktemp)
unset npm_config_prefix
script -q -c "nvm use && npx marked --silent -v -i \"$markdown_file\" | cat" -f "$rendered_file" > /dev/null

# remove the first 3 and last 2 lines added by the script command above
tail -n +4 "$rendered_file" | head -n -2 > "${rendered_file}_temp" && mv "${rendered_file}_temp" "$rendered_file"

# print the rendered markdown prefixed with line numbers
awk '{ printf "%6d\t%s\n", NR, $0 }' "$rendered_file"

# lint the markdown representation of the OpenAPI spec using Vale
vale --no-wrap "$markdown_file" | grep -v "$markdown_file"
