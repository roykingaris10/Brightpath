#!/bin/sh
# Concatenate the source parts into the single self-contained artifact.
set -e
cd "$(dirname "$0")"
cat src/00-head.html \
    src/10-world.js \
    src/20-artefacts.js \
    src/22-risk.js \
    src/24-supplier.js \
    src/26-incident.js \
    src/30-days.js \
    src/40-grade.js \
    src/50-engine.js \
    src/60-ui.js \
    src/70-boot.js \
    src/99-tail.html > /tmp/grc-body.html
{
  head -n "$(grep -n '^</style>$' /tmp/grc-body.html | head -1 | cut -d: -f1)" /tmp/grc-body.html
  echo '<div id="app"></div>'
  tail -n +"$(( $(grep -n '^</style>$' /tmp/grc-body.html | head -1 | cut -d: -f1) + 1 ))" /tmp/grc-body.html
} > index.html
rm -f /tmp/grc-body.html
echo "built index.html — $(wc -c < index.html) bytes"
