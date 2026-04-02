#!/usr/bin/env bash
set -e

if [ ! -d "fricas0" ]; then
  git clone https://github.com/oldk1331/fricas0.git
fi

cd fricas0
find . -type f | sed 's|^./||' | python3 ../generate_fricas_fs_json.py > ../fricas-fs.json