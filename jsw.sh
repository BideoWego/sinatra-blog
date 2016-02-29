#!/usr/bin/env bash

IN="$PWD/public/assets/javascripts/"
BUILD="$PWD/js-build.sh"

echo "JavaScript builder recursively watching:"
echo "  $IN"
echo
echo "Waiting for file changes..."
echo

fswatch -or $IN | xargs -n1 $BUILD

