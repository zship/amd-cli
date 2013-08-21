amd-circulars(1) -- find circular dependencies
==============================================


SYNOPSIS
--------

`amd circulars` [<pool>...] [-g|--group=<num>] [-v|--(no-)verbose]
                [-c|--config=<path>] [-b|--base-url=<url>]


DESCRIPTION
-----------

Each line of output represents a circular dependency cycle--that is, a list of
modules displayed so that each module depends on the next module in the list,
with the last module depending on the first. For example:

.. app/global/models -> app/models/UserCollection -> app/models/UserModel ..

Is read: "app/global/models depends on app/models/UserCollection, which depends
on app/models/UserModel, **which depends on app/global/models (a cycle)**, ...".
Because cycles "loop around themselves" infinitely, this cycle can be
"rotated"/"shifted" left or right for display and still be considered
equivalent. Here is the same cycle rotated one slot right for each new line:

.. app/global/models -> app/models/UserCollection -> app/models/UserModel ..<br>
.. app/models/UserModel -> app/global/models -> app/models/UserCollection ..<br>
.. app/models/UserCollection -> app/models/UserModel -> app/global/models ..<br>
.. app/global/models -> app/models/UserCollection -> app/models/UserModel ..<br>

`amd circulars` performs this rotation in order to make the likeliest causes of
circular dependencies more apparent. This can help patterns emerge when a
project has a large number of circular dependencies. The algorithm is
straightforward enough: find the module which appears in the most circular
dependency chains, then rotate every chain containing that module until the
module appears in the first slot. This results in a visual grouping. Here's a
contrived example:

.. app/global/models -> app/models/ProfileModel -> app/models/BaseModel -> app/service/BigService ..<br>
.. app/global/models -> app/models/ProfileModel -> app/models/RestaurantCollection -> app/models/RestaurantModel ..<br>
.. app/global/models -> app/models/RestaurantCollection -> app/models/BaseCollection -> app/service/BigService ..<br>
.. app/global/models -> app/models/UserModel -> app/models/BaseModel -> app/service/BigService ..<br>

"app/global/models" appears first because it was found to be present in all of
the above cycles. Due to the name and what it depends on, it looks like this is
just a module containing references to other modules. There are a few ways to
go about this, but the simplest way would be to remove "app/global/models". You
can use amd-whatrequires(1) to find every module referencing
"app/global/models" and replace the `require("app/global/models")` calls with
calls to require the individual modules which used to be inside
"app/global/models". The drawback is more typing, but I'll leave that up to you
to decide.

`amd circulars` scans all files from a combined dependency graph formed from
each <module> in <pool> (see "Identifier Terminology" in amd(1) for these
terms). <pool> can be derived from your RequireJS configuration if it uses the
`modules` or `include` properties (See "RequireJS Configuration" in amd(1)).


OPTIONS
-------

* -g <num>, --group=<num>:
  Split the cycle list into (non-exclusive) groups based on a common
  subsequence of length <num>. This is to answer questions like "In how many
  cycles does 'x -> y' appear? Is 'a -> b' more common? (--group=2) How about
  'a -> b -> c'? (--group=3)". The default display of `amd circulars` (with no
  --group) is actually a simplified form of --group=1 (show the group of cycles
  containing the most common module, then, to simplify, all remaining cycles
  un-grouped).

* -v, --verbose, --no-verbose:
  Show more information. Among other things, this will show the full AMD
  configuration object in effect. --no-verbose disables a previously-set
  --verbose flag.

* -c <path>, --config=<path>:
  The file <path> to a RequireJS configuration object. See the "RequireJS
  Configuration" section in amd(1) for details.

* -b <path>, --base-url=<path>:
  A RequireJS configuration `baseUrl` property to use. This is the most
  commonly needed property, so it can be set here for convenience. --base-url
  will override any `baseUrl` property gotten from --config.


AMD
---

Part of the amd(1) suite
