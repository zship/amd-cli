amd-normalize(1) -- canonicalize a module name
==============================================


SYNOPSIS
--------

`amd normalize` <module>...  [-v|--(no-)verbose] [-c|--config=<path>]
                [-b|--base-url=<url>]


DESCRIPTION
-----------

`amd normalize` converts relative module names and relative/absolute file paths
to "module IDs". These are canonicalized file names relative to --base-url or
otherwise transformed by your RequireJS configuration's `paths` property. This
is the usual way to express module names (e.g. "mout/lang/clone" as opposed to
"../lang/clone").


EXAMPLES
--------

* amd normalize ./src/app/util/log
  If your --base-url was "src", this would output "app/util/log".


AMD
---

Part of the amd(1) suite
