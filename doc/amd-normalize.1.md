amd-normalize(1) -- canonicalize a module name
==============================================


SYNOPSIS
--------

`amd normalize` [<module>...]  [-v|--(no-)verbose] [-c|--config=<path>]
                [-b|--base-url=<url>]


DESCRIPTION
-----------

`amd normalize` converts relative module names and relative/absolute file paths
to "module IDs". These are canonicalized file names relative to --base-url or
otherwise transformed by your RequireJS configuration's `paths` property. This
is the usual way to express module names (e.g. "mout/lang/clone" as opposed to
"../lang/clone").

If <module> is not specified, `amd normalize` will read from stdin.


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

* amd normalize ./src/app/util/log
  If your --base-url was "src", this would output "app/util/log".

* find src -name \*.js | amd normalize
  For each line of `find`'s output, returns the normalized module name.


AMD
---

Part of the amd(1) suite
