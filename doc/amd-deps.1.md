amd-deps(1) -- show a module's dependencies
===========================================


SYNOPSIS
--------

`amd deps` <module>... [--(no-)location] [--(no-)normalize] [--(no-)resolve]
           [--(no-)color] [-v|--(no-)verbose] [-c|--config=<path>]
           [-b|--base-url=<url>]


DESCRIPTION
-----------

Displays one or more <module>'s dependencies exactly as they are declared. The
--normalize and --resolve options can be used to display canonicalized versions
of these dependencies (either AMD module ID or filesystem-absolute) instead.
Can recognize both AMD-style `define(['dep1', 'dep2'], function(dep1, dep2)
{...` and CommonJS-style `var dep1 = require('dep1')`.


OPTIONS
-------

* --color, --no-color:
  Colorize output similar to `grep`. --no-color disables a previously-set
  --color flag and ensures a machine-parseable output.

* --location, --no-location:
  Show the file, line, and column number of each declared dependency.
  --no-location disables a previously-set --location flag.

* --normalize, --no-normalize:
  Convert each dependency name to a "module ID", which is a canonicalized file
  name relative to --base-url or otherwise transformed by your RequireJS
  configuration's `paths` property. This is the usual way to express module
  names (e.g. "mout/lang/clone" as opposed to "../lang/clone"). See
  amd-normalize(1) for a more general solution.

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


AMD
---

Part of the amd(1) suite
