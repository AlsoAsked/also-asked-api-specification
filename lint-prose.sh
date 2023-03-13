#!/usr/bin/env bash

contents=$(npm exec -- widdershins --user_templates widdershins/openapi3/ --omitBody --omitHeader --summary openapi/openapi.yaml | sed -n '/Compiling main.dot to function/,$p' | sed -n '1,/Compiling main.dot to function/d; p' | sed '/^$/d')

echo "Content:"
echo ""
echo "$contents" | nl

echo ""
echo "Results:"
echo "$contents" | vale
