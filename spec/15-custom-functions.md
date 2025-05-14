# Custom Functions

Custom functions are reusable sets of query substructures that allow for the modular composition of GROQ queries.

## Function Definition

Functions MUST be defined in the beginning of a query using the delimiter `;`.
A function definition MUST start with the keyword `fn`.
All custom defined functions MUST live in a namespace.

```
fn namespaceName::functionName($parameter) = $parameter{
  ...
};
```

The function body MUST be in one of the forms:

- `$param{…}`
- `$param->{…}`
- `$param[]{…}`
- `$param[]->{…}`
  In addition, the parameter MUST NOT be referenced anywhere else in the body.

## Function Scope

Custom functions are scoped to the query in which they are defined. They can be used anywhere in the query after their definition, but not before.

## Function invocation

Functions are invoked similarly to other programming languages - namespaceName::functionName($parameter)
