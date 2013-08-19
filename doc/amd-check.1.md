amd-check(1) -- check for broken dependencies
=============================================


SYNOPSIS
--------

`amd check` [<pool>...] [--(no-)color] [-v|--(no-)verbose] [-c|--config <path>]
            [-b|--base-url <url>]


DESCRIPTION
-----------

Displays a list of files containing `require()` calls which can't be resolved
to actual files. Also checks if RequireJS plugins are able to load with their
given "!" arguments. The output is in classic linter style, e.g.:

/path/to/script.js:5:23: Error details<br>
(file:line:col: Error details)

Scans all files from a combined dependency graph formed from each <module> in
<pool> (see "Identifier Terminology" in amd(1) for these terms). <pool> can be
derived from your RequireJS configuration if it uses the `modules` or `include`
properties (See "RequireJS Configuration" in amd(1)).


OPTIONS
-------

* --color | --no-color:
  Colorize output similar to `grep`. --no-color disables a previously-set
  --color flag and ensures a machine-parseable output.

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
