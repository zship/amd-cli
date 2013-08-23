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


SHARED OPTIONS
--------------

These options are common to all `amd` commands. They're declared separately in
order to distinguish the command-specific options in the "Options" section,
which are more likely to be what you're looking for.

* -b <path>, --base-url=<path>:
  A RequireJS configuration `baseUrl` property to use. This is the most
  commonly needed property, so it can be set here for convenience. --base-url
  will override any `baseUrl` property gotten from --config.

* -c <path>, --config=<path>:
  The file <path> to a RequireJS configuration object. See the "RequireJS
  Configuration" section in amd(1) for details.

* -v, --verbose, --no-verbose:
  Show more information. Among other things, this will show the full AMD
  configuration object in effect. --no-verbose disables a previously-set
  --verbose flag.


EXAMPLES
--------

* amd resolve mout/object/merge
  Assuming a project inside "~/projects/myapp", a --base-url of ".", and a
  `paths` property containing `{"mout": "lib/mout"}`, this would output
  "~/projects/myapp/lib/mout/object/merge.js".


AMD
---

Part of the amd(1) suite
