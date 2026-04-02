#!/usr/bin/env bash

set -eux

mkdir -p web-example
cp web-template/* web-example
cp fricas-fs.json web-example
cp ecl-workspace/ecl/build/bin/ecl.js ecl-workspace/ecl/build/bin/ecl.wasm web-example
cp -r fricas0 web-example

cd web-example
python3 -m http.server 9999