amd-cli
=======

amd-cli is a set of command-line utilities for JavaScript projects which employ
the Asynchronous Module Definition format. They can be used to diagnose
problems (`amd check`, `amd circulars`) or to gain a deeper understanding of a
project's structure (`amd deps`, `amd graph`).

Folks wanting programmatic access can use
[libamd](https://github.com/zship/libamd), the base of this project.


Installation
------------

`[sudo] npm install -g amd-cli`


Usage
-----

`amd <command>`

Commands:

* `amd check`
  Run a linter-style check for broken dependencies

* `amd circulars`
  Find and group circular dependencies

* `amd deps`
  Print an AMD module's dependencies

* `amd graph`
  Print a linearized dependency graph stemming from one or more modules

* `amd help`
  Open the manpage for an `amd` command. This is a fallback in case of
  $MANPATH, manpath.config, or npm manpage install issues.

* `amd normalize`
  Print the canonical AMD module name for a given relative AMD module name or
  file path

* `amd resolve`
  Print the canonical file path for a given AMD module name

* `amd whatrequires`
  Print all files which depend on a given AMD module

Much more detail can be found in the manpages.


Documentation
-------------

`man amd`

Some versions of npm have [a bug](https://github.com/isaacs/npm/issues/3405)
which causes manpages not to be linked properly. There are a few ways to handle
this:

* Upgrade npm
  1. `[sudo] npm install -g npm`
  2. Re-install amd-cli: `[sudo] npm install -g amd-cli`
* Check that npm's prefix "share" directory is in your MANPATH
  1. Get the prefix under which npm installs global packages: `npm prefix -g`
  2. Mentally add "/share/man" to the end of this path i.e. `echo $(npm prefix
     -g)/share/man`
  3. `echo $MANPATH` - this should contain the path in #2 (npm prefix +
     "/share/man"). If not, move on to #4.
  4. Add it: `MANPATH=$MANPATH:"$(npm prefix -g)/share/man"`
  5. Try it out: `man amd`
  6. Make it permanent by copy/pasting the command in #4 to your `~/.bashrc`,
     or just run:
     `echo 'MANPATH=$MANPATH:"$(npm prefix -g)/share/man"' >> ~/.bashrc`
* Manually add just amd-cli's manpages to your MANPATH
  1. The manpages are in a directory called "man" adjacent to the installed
     `amd` script. Check that the directory is there:
     `cd "$(dirname $(readlink -f $(which amd) ) )/../man"`
  2. Then add it:
     `MANPATH=$MANPATH:"$(dirname "$(readlink -f "$(which amd)" )" )/../man"`
  3. Try it out: `man amd`
  4. Make it permanent by copy/pasting the command in #4 to your `~/.bashrc`,
     or just run:
     `echo 'MANPATH=$MANPATH:"$(dirname "$(readlink -f "$(which amd)" )" )/../man"' >> ~/.bashrc`
* Use the fallback `amd help` command
  * `amd help`, `amd help deps`, etc.


License
-------

Released under the [MIT
License](http://www.opensource.org/licenses/mit-license.php).
