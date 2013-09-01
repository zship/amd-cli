amd-graph(1) -- trace the dependency graph rooted at a module
=============================================================


SYNOPSIS
--------

`amd graph` <module>... [--dot] [-l|--(no-)linearize] [-r|--(no-)reverse]
            [--(no-)normalize] [--(no-)resolve] [-v|--(no-)verbose]
            [-c|--config=<path>] [-b|--base-url=<url>]


DESCRIPTION
-----------

`amd graph` gets the dependencies of each given <module>, then the dependencies
of each dependency recursively until no dependencies remain and a complete
directed acyclic dependency graph of each <module> is formed. The default
output represents the edges of the graph(s) in a tsort(1)-compatible
format--that is, each line contains one module and one dependency of that
module:

parent child1<br>
parent child2<br>
child1 grandchild1<br>
child1 grandchild2<br>
child2 grandchild3<br>

Use --linearize to display just the vertices in (one of many valid) topological
sort ordering(s). `amd graph <module> | tsort` can be used to achieve the same
result.

parent<br>
child2<br>
child1<br>
grandchild3<br>
grandchild2<br>
grandchild1<br>

--reverse this to obtain a "bottom-up" ordering suitable for module loaders.
Again, "tried-and-true" tools can be used to produce the same result: `amd
graph <module> | tsort - | tac`.

grandchild1<br>
grandchild2<br>
grandchild3<br>
child1<br>
child2<br>
parent<br>

Modules are displayed as file paths relative to the current working directory.
Use --normalize or --resolve to format them differently.


OPTIONS
-------

* --dot:
  Display output in DOT format. This can be used with Graphviz to generate
  visualizations of your dependency graph. You might want to combine with
  --normalize to keep visualized node labels short but unambiguous. See
  "Examples" below.

* -l, --linearize, --no-linearize:
  Display the vertices of the graph, i.e. each unique module only once.
  Ordering is top-down (with the given root <module> displayed first, followed
  by its dependencies, etc.). Use --reverse to display the graph in the order
  needed for module loading.

* --normalize, --no-normalize:
  Convert each dependency name to a "module ID", which is a canonicalized file
  name relative to --base-url or otherwise transformed by your RequireJS
  configuration's `paths` property. This is the usual way to express module
  names (e.g. "mout/lang/clone" as opposed to "../lang/clone"). See
  amd-normalize(1) for a more general solution.

* -r, --reverse, --no-reverse:
  Display the graph "bottom-up", from modules with no dependencies to the root
  module(s). This is the ordering used by the RequireJS optimizer which ensures
  that each module's dependencies are loaded before the modules themselves.

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

`$ amd graph --normalize app/main`

  Generate the dependency graph rooted at the "app/main" module. Display every
  module in the graph along with its dependencies, normalized to AMD module
  IDs.

`$ dot -Tpng <(amd graph --normalize --dot app/main) > graph.png`

  Use [Graphviz](http://www.graphviz.org/) to generate a PNG image visualizing
  the dependency graph. This example uses bash process substitution to pass
  --dot formatted output to the dot(1) command.

`$ amd graph --normalize --dot app/main > graph.dot; /path/to/gephi/bin/gephi -o graph.dot`

  View the dependency graph interactively with [Gephi](https://gephi.org/).


AMD
---

Part of the amd(1) suite
