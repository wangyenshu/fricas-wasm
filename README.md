# How to build?
## If you want to use raw lisp: (tested)
- run `build.sh`
- run `build_fricas_fs.sh`
- run `run-web-demo.sh`
## If you want to compile lisp to bytecode: (integration not working)
- run `build.sh`
- run `git clone https://github.com/oldk1331/fricas0.git`, then `cd fricas0`
- add following to the top of fricas.lisp:

```lisp
(ext:set-limit 'ext:heap-size 256000000) 
(ext:install-bytecodes-compiler)
(setq |$lisp_bin_filetype| "fasc") 
```
- add following to the top of lisp/compile-interp.lisp:
```lisp
(ext:install-bytecodes-compiler)
```
- run `ecl --load fricas`, then `)lisp (load "lisp/compile-interp.lisp")`
- run `sed -i 's/")/.fasc")/g' lisp/interp.lisp`
- then exit fricas, run `find . -type f | sed 's|^./||' | python3 ../generate_fricas_fs_json.py`
- run `cd ..`, then `run-web-demo.sh`

# Remark:
- web-template/fricas-fs.js: This script preloads files listed in `startup_manifest.json` into idbfs and lazyloads the remaining files.
- build_startup_manifest.js: This node script is used to create `startup_manifest.json`. Place and execute it in web root and visit localhost:9999 to capture and overwrite the `startup_manifest.json` file.
- deprecated/fricas-fs-lazyloading.js: This script lazyloades all files.

# Issue:
- integration does not work on chrome

# Credit
- https://github.com/oldk1331/fricas0
- https://gitlab.com/embeddable-common-lisp/ecl
