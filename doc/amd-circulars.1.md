amd-circulars(1) -- find circular dependencies
==============================================


SYNOPSIS
--------

`amd circulars`


DESCRIPTION
-----------


OPTIONS
-------

* -v | --verbose | --no-verbose:
  Show more information. Among other things, this will show the full AMD
  configuration object in effect. --no-verbose disables a previously-set
  --verbose flag.

* -c | --config:
  The file <path> to a RequireJS configuration object. See the "RequireJS
  Configuration" section in amd(1) for details.

* -b | --base-url:
  A RequireJS configuration `baseUrl` property to use. This is the most
  commonly needed property, so it can be set here for convenience. `--base-url`
  will override any `baseUrl` property gotten from `--config`.


AMD
---

Part of the amd(1) suite
