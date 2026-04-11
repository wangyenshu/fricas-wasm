# How to build?
## If you want to use raw lisp: (tested)
- run `build.sh`
- run `build_fricas_fs.sh`
- run `run-web-demo.sh`
## If you want to compile lisp to bytecode:
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
- web-template/fricas-fs.js: this preloads all files listed in fricas-fs.json to IDBFS (recommended for performance)
- web-template/fricas-fs-lazyloading.js: this loads files on demand

# Credit
- https://github.com/oldk1331/fricas0
- https://gitlab.com/embeddable-common-lisp/ecl
