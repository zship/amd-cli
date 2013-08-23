amd-help(1) -- display the manpage for an amd command
=====================================================


SYNOPSIS
--------

`amd help` <command>


DESCRIPTION
-----------

`amd help` is a fallback to access the manpages when they have not been linked
properly. It is also a godsend for people who enjoy remembering subtly
different ways to do the same thing for every command line tool in their
arsenal. Use man(1) e.g. `man amd`, `man amd-check`, `man amd-graph`, etc. if
at all possible.  If that's not working and it's not worth the effort to fix
it, `amd help` is here for you.

It's just a simple wrapper that invokes `man`, but it always knows where the
manpages are located regardless of MANPATH or ~/.manpath settings.


EXAMPLES
--------

* amd help:
  Show the manpage for the main `amd` command

* amd help check:
  Show the manpage for the `amd check` command


AMD
---

Part of the amd(1) suite
