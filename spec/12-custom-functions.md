# Custom Functions

Custom functions are reusable sets of query substructures that allow for the modular composition of GROQ queries.

## Function Definition

Functions MUST be defined in the beginning of a query using the delimiter `;`.
A function definition MUST start with the keyword `fn`.
All custom defined functions MUST live in a namespace.

FuncDecl : `fn` FuncNamespace FuncIdentifier FuncParams `=` FuncBody `;`

## Function invocation

FuncParams : `(` Param `)`
