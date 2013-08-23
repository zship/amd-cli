amd-resolve(1) -- print the absolute file path of a module
==========================================================


SYNOPSIS
--------

`amd resolve` <module>...  [-v|--(no-)verbose] [-c|--config=<path>]
              [-b|--base-url=<url>]


DESCRIPTION
-----------

`amd resolve` converts module names to absolute file paths using --base-url and
your RequireJS configuration's `paths` and/or `packages` properties.


EXAMPLES
--------

* amd resolve mout/object/merge
  Assuming a project inside "~/projects/myapp", a --base-url of ".", and a
  `paths` property containing `{"mout": "lib/mout"}`, this would output
  "~/projects/myapp/lib/mout/object/merge.js".


AMD
---

Part of the amd(1) suite
