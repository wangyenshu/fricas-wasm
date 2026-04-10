# How to build?
- run `build.sh`
- run `git clone https://github.com/oldk1331/fricas0.git`, then `cd fricas0`
- add following to fricas.lisp:

```lisp
(ext:set-limit 'ext:heap-size 256000000) 
(ext:install-bytecodes-compiler)
(setq |$lisp_bin_filetype| "fasc") 
```
- add following to lisp/compile-interp.lisp:
```lisp
(ext:install-bytecodes-compiler)
```
- run `ecl --load fricas`, then `)lisp (load "lisp/compile-interp.lisp")`
- then exit fricas, run `find . -type f | sed 's|^./||' | python3 ../generate_fricas_fs_json.py`
- run `cd ..`, then `run-web-demo.sh`

# Credit
- https://github.com/oldk1331/fricas0
- https://gitlab.com/embeddable-common-lisp/ecl
