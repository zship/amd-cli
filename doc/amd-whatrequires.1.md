amd-whatrequires(1) -- find all modules which require a specific module
=======================================================================


SYNOPSIS
--------

`amd whatrequires` <module> [<pool>...] [-l|--(no-)location]
                   [-R|--(no-)recursive] [--(no-)normalize] [--(no-)resolve]
                   [-v|--(no-)verbose] [-c|--config=<path>]
                   [-b|--base-url=<url>]


DESCRIPTION
-----------

`amd whatrequires` searches the dependencies of all modules in <pool> for
references to <module>, outputting a list of modules which require <module>.
<pool> can be derived from your RequireJS configuration if it uses the
`modules` or `include` properties (See "RequireJS Configuration" in amd(1)).


OPTIONS
-------

* -l, --location, --no-location:
  Show the line, column number, and name of the <module> exactly as it was
  declared in each `require()`-ing module. --no-location disables a
  previously-set --location flag.

* --normalize, --no-normalize:
  Convert each dependency name to a "module ID", which is a canonicalized file
  name relative to --base-url or otherwise transformed by your RequireJS
  configuration's `paths` property. This is the usual way to express module
  names (e.g. "mout/lang/clone" as opposed to "../lang/clone"). See
  amd-normalize(1) for a more general solution.

* -R, --recursive, --no-recursive:
  Trace the full dependency graph of each <module> given in <pool>,
  concatenating every dependency back into the pool.

* --resolve, --no-resolve:
  Convert each dependency name to an absolute file path. See amd-resolve(1) for
  a more general solution.


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

Assuming a --base-url of ".", and a `paths` property containing `{"mout":
"lib/mout"}` (mout 0.7):

$ amd whatrequires mout/lang/isKind

lib/mout/lang/isArray.js<br>
lib/mout/lang/isObject.js<br>
lib/mout/lang/isFunction.js<br>

$ amd whatrequires mout/lang/isKind --location

lib/mout/lang/isArray.js:1:8: as "./isKind"<br>
lib/mout/lang/isObject.js:1:8: as "./isKind"<br>
lib/mout/lang/isFunction.js:1:8: as "./isKind"<br>


AMD
---

Part of the amd(1) suite
