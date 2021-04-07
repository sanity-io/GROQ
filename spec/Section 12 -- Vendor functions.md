# Vendor functions

An implementation is free to introduce additional functions than what is presented in this specification, but this is problematic if a function with the same name is introduced in a future version. The following section defines optional *vendor functions* which are guaranteed to never be a regular function in a future specfication. There's also a short description of each vendor function so different implementations can attempt to be compatible with each other. The description is intentially brief and it's up to the vendor to define it completely.

## global::identity()

The identity function should accept zero arguments and return a string which represents the identity of the client executing the query.

## global::path()

The path function should accept a single argument and return a path object.
