amd-unused(1) -- find unused modules
====================================


SYNOPSIS
--------

`amd unused` <pool>... [-v|--(no-)verbose] [-c|--config=<path>]
                [-b|--base-url=<url>]


DESCRIPTION
-----------

`amd unused` finds all modules in <pool> which are not require()'d by any other
module in <pool>. These may be good candidates for deletion. <pool> can be
derived from your RequireJS configuration if it uses the `modules` or `include`
properties (See "RequireJS Configuration" in amd(1)).


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

* amd unused src/
  Finds all unused modules in your project's src/ directory. This is the
  expected use case for just about any project; that is, scanning a whole
  source directory rather than spelling out individual modules.


AMD
---

Part of the amd(1) suite
