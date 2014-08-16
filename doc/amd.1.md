amd(1) -- diagnostic tools for AMD projects
===========================================


SYNOPSIS
--------

`amd` [--version]
`amd` <command> [-v|--(no-)verbose] [-c|--config=<path>] [-b|--base-url=<url>]
      [<command-args>]


DESCRIPTION
-----------

amd-cli is a suite of command-line utilities for JavaScript projects which
employ the Asynchronous Module Definition format. They can be used to diagnose
problems (`amd check`, `amd circulars`) or to gain a deeper understanding of a
project's structure (`amd deps`, `amd graph`).


OPTIONS
-------

These options are applicable to almost all commands:

* -v, --verbose, --no-verbose:
  Show more information. Among other things, this will show the full AMD
  configuration object in effect. --no-verbose disables a previously-set
  --verbose flag.

* -c <path>, --config=<path>:
  The file <path> to a RequireJS configuration object. See the "RequireJS
  Configuration" section for details.

* -b <path>, --base-url=<path>:
  A RequireJS configuration `baseUrl` property to use. This is the most
  commonly needed property, so it can be set here for convenience. --base-url
  will override any `baseUrl` property gotten from --config.

* -e <path>, --entry-point=<path>:
  The filesystem path representing your web server's root directory, to which
  --base-url is relative. This can be useful when using the --config option, as
  it allows you to re-use the same configuration you use in production without
  modifying any paths.


COMMANDS
--------

Invoke the following commands git-style e.g. `amd check`. Manpages can be
accessed with e.g. `man amd-check`.

* amd-check(1):
  Run a linter-style check for broken dependencies

* amd-circulars(1):
  Find and group circular dependencies

* amd-deps(1):
  Print an AMD module's dependencies

* amd-graph(1):
  Print a linearized dependency graph stemming from one or more <module>s

* amd-help(1):
  Open the manpage for an `amd` command. This is a fallback in case of
  $MANPATH, manpath.config, or npm manpage install issues.

* amd-normalize(1):
  Print the canonical AMD module name for a given relative AMD module name or
  file path

* amd-resolve(1):
  Print the canonical file path for a given AMD module name

* amd-whatrequires(1):
  Print all files which depend on a given AMD module


IDENTIFIER TERMINOLOGY
----------------------

* <module>:
  An AMD module ID ("mout/array/unique", "./util/log") or file path to an AMD
  module ("./src/filter.js").

* <pool>:
  One or more <module>s to indicate files inside your project (as opposed to
  your project's dependencies). Shell globbing works as expected. If a
  directory is specified, it will be expanded to '<directory>/\*\*/\*.js' (i.e.
  find all JavaScript files under the directory). Commands like
  `amd-whatrequires` use <pool> to restrict their search to a manageable
  subset. *May be omitted* if your RequireJS configuration uses
  optimizer-specific options like `include` and `modules`.


.AMDCONFIG FILE
---------------

Configuration can specified in a special JSON file called **.amdconfig** in
lieu of using options like --base-url and --configuration. Inside this file,
`baseUrl` will be interpreted relative to the directory containing
**.amdconfig**. The `mainConfigFile` property can be used to load more
configuration from elsewhere (properties inside **.amdconfig** will have a
higher precedence).

`amd` searches for this file starting from the current working directory all
the way up to '/'.  Your project's root is a good place to put it.


AUTOMATIC CONFIGURATION
-----------------------

If no **.amdconfig** file is found and no --base-url, --config, or
--entry-point options are present, `amd` will fall back to a heuristic method
for finding your configuration. The procedure is as follows:

1. Find the project root. Looks upward from your current working directory for
   several common files (.git, package.json, bower.json, etc.) and uses the
   first-found's parent directory.

2. Find a file under the project root containing the string "require.config("
   and use this as the --config option. If this is a git repository, use
   .gitignore rules to exclude files that aren't yours (node_modules,
   bower_components, generated files, etc.). After that, assume the shortest
   matching file is the likeliest candidate for config that you wrote.

3. Take --base-url from the config file found in step #2. Determine
   --entry-point by taking the absolute path to the config file and looking for
   a directory (string-)matching --base-url, then using its parent directory.

The conditions to trigger automatic configuration are intentionally strict
(essentially only if you tell `amd` nothing at all about your project). It
works reasonably well and reasonably quickly, but is as error-prone as any
heuristic method. It's mainly intended for having a shot at getting
up-and-running with a foreign codebase quickly. If it works, great!; you can
now use `amd` commands to (hopefully) help you paint a picture with less
effort! If you use the --verbose option, `amd` will also show you what guesses
are being made.


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

* `shim`:
  Denotes dependencies of non-AMD scripts.

These RequireJS optimizer
(http://requirejs.org/docs/optimization.html#mainConfigFile) options are also
recognized:

* `mainConfigFile`:
  Load additional configuration from this file path. The additional
  configuration will have lower precedence than any properties specified in the
  same context as `mainConfigFile`.

* `modules`, `include`, `exclude`, `excludeShallow`:
  Module IDs which will be used together to create a flattened dependency graph
  for the <pool> argument of `amd` commands. They behave the same as the
  RequireJS optimizer with one difference: paths may be globbed in bash
  globstar format.

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
  },
  // 'my project files consist of every module starting with "deferreds/"'
  include: ["deferreds/**"]
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

3. **.amdconfig** file (See '.amdconfig File' section above)
