#!/usr/bin/env bash

OUT="$PWD/public/assets/js/script.js"

FILES=(
  'folder'
  'blog/archive'
  'blog/categories'
  'blog/tags'
)

# --------------------------------------------

echo "Files changed!"
echo "Building JavaScripts..."

touch $OUT
: > $OUT
echo "// =========" >> $OUT
echo "//JavaScript" >> $OUT
echo "// =========" >> $OUT
echo >> $OUT
echo >> $OUT

for FILE in "${FILES[@]}"
do
  cat "$PWD/public/assets/javascripts/${FILE}.js" >> $OUT
done


echo "Done."
echo

