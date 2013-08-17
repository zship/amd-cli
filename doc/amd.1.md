amd(1) -- diagnostic tools for AMD projects
================================================


SYNOPSIS
--------

`amd` <command> [-v|--verbose] [-c|--config <path>] [-b|--base-url <url>]


OPTIONS
-------

* -v or --verbose:
  Show more information. Among other things, this will show the full AMD
  configuration object in effect.

* -c or --config:
  The file <path> to a RequireJS configuration object. See the "RequireJS
  Configuration" section for details.

* -b or --base-url:
  A RequireJS configuration `baseUrl` property to use. This is the most
  commonly needed property, so it can be set here for convenience. `--base-url`
  will override any `baseUrl` property gotten from `--config`.


amd COMMANDS
-----------------

Invoke the following commands git-style e.g. `amd check`. Manpages can be
accessed with e.g. `man amd-check`.

* amd-check(1):
  Run a linter-style check for broken dependencies

* amd-deplist(1):
  Print an AMD module's dependencies as-declared

* amd-normalize(1):
  Print the canonical AMD module name for a given relative AMD module name or
  file path

* amd-resolve(1):
  Print the canonical file path for a given AMD module name

* amd-whatrequires(1):
  Print all files which depend on a given AMD module


REQUIREJS CONFIGURATION
-----------------------

AMD-based projects normally specify a special configuration object which module
loaders can use for path resolution. `amd` can take advantage of these
RequireJS configuration (http://requirejs.org/docs/api.html#config) properties:

* `baseUrl`:
  The root against which module paths and paths inside `paths` config will be
  resolved.

* `paths`:
  A mapping of key:value pairs with keys being aliases and values being
  filesystem paths to-be-aliased. Values are relative to `baseUrl` if not
  absolute.

* `packages`:
  Similar to `paths` but uses CommonJS directory structure. Specified as an
  Array of mapping Objects with the properties `name` (alias to use),
  `location` (filesystem path), and `main` (the filename to use when a
  directory is requested).

* `mainConfigFile`:
  Load additional configuration from this file path. The additional
  configuration will have lower precedence than any properties specified in the
  same context as `mainConfigFile`. This is a RequireJS optimizer option
  (http://requirejs.org/docs/optimization.html#mainConfigFile).

* `shim`:
  Denotes dependencies of non-AMD scripts.

A configuration object declared inside of a JavaScript file looks like this:

```js
require.config({
  baseUrl: "js",
  // A request to "deferreds/forEach" will resolve to
  // "<baseUrl>/src/forEach.js"
  paths: {
    deferreds: "src",
    mout: "lib/mout",
    signals: "lib/signals"
  },
  // A request to "pixie/some_directory" will resolve to
  // "<baseUrl>/pixie/some_directory/index.js"
  packages: [
    {
      name: "pixie",
      location: "lib/pixie",
      main: "index"
    }
  ],
  // shim config supports a few different syntaxes
  shim: {
    "jquery.colorize": {
      deps: ["jquery"],
      exports: "jQuery.fn.colorize"
    }
    "jquery.scroll": ["jquery"]
  }
});
```

### Location

`amd`'s `--config` argument can accept RequireJS configuration objects
from:

1. A .js file containing a configuration object declared in a
   RequireJS-compatible way

    - `require({}, ...)`
    - `requirejs({}, ...)`
    - `require.config({}, ...)`
    - `requirejs.config({}, ...)`
    - `var require = {}`
    - `var requirejs = {}`

2. A .json file

Configuration can also be given in a special JSON file called **.amdconfig**.
`amd` searches for this file starting from the current working directory
all the way up to '/'. Inside of this file, `baseUrl` and `mainConfigFile`
will be interpreted relative to the directory containing **.amdconfig**. It's
recommended to place this file in your project's root directory to simplify
`amd` commands.
