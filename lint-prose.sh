#!/usr/bin/env bash

input=$(npm exec -- widdershins --user_templates widdershins/openapi3/ --omitBody --omitHeader --summary openapi/openapi.yaml | sed -n '/Compiling main.dot to function/,$p' | sed -n '1,/Compiling main.dot to function/d; p' | sed '/^$/d')

echo "Input:"
echo ""
echo "$input" | nl

echo ""
echo "Results:"
echo "$input" | vale
echo ""
