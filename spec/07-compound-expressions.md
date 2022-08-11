# Compound expressions

## Parenthesis expression

A parenthesis expression allows you to add parenthesis around another expression to control precedence of operators.

```example
(1 + 2) * 3
~~~~~~~
```

Parenthesis : ( Expression )

EvaluateParenthesis(scope):

- Let {innerNode} be the {Expression}.
- Let {result} be the result of {Evaluate(innerNode, scope)}.
- Return {result}.

## Traversal expression

A traversal expressions starts a traversal.

```example
users.foo.bar[0].sources[]->name
```

When the left-hand side is an {Everything}, {Array}, or {PipeFuncCall} this is interpreted as if there was an additional explicit {ArrayPostfix} traversal.
E.g. `*._id` is interpreted as `*[]._id` and therefore returns an array of IDs.

TraversalExpression : Expression Traversal

Traversal :

- TraversalPlain
- TraversalArray
- TraversalArraySource
- TraversalArrayTarget

EvaluateTraversalExpression(scope):

- Let {node} be the {Expression}.
- Let {traversalNode} be the {Traversal}.
- Let {base} be the result of {Evaluate(node, scope)}.
- If {node} is one of {Everything}, {Array}, {PipeFuncCall}:
  - Let {traverse} be the traversal function for the combination {ArrayPostfix} and {traversalNode}.
- Otherwise:
  - Let {traverse} be the traverse function of {traversalNode}.
- Return {traverse(base, scope)}.

## Pipe function call expression

GROQ comes with a set of built-in pipe functions which provides additional features. Pipe functions always accepts an array on the left-hand side and returns another array, and the syntax is optimized for being able to chain it together with other compound expressions. See the ["Pipe functions"](#sec-Pipe-functions) for available functions.

```example
*[_type == "person"] | order(name) | {age}
                     ~~~~~~~~~~~~~
```

PipeFuncCall : Expression `|` FuncCall

EvaluatePipeFuncCall(scope):

- Let {baseNode} be the first Expression.
- Let {base} be the result of {Evaluate(baseNode, scope)}.
- If {base} is not an array:
  - Return {null}.
- Let {name} be the string value of the {Identifier} of the {FuncCall}.
- Let {args} be an empty array.
- For each {Expression} in the {FuncCallArgs} of the {FuncCall}.
  - Let {argumentNode} be the {Expression}.
  - Append {argumentNode} to {args}.
- Let {func} be the pipe function defined under the name {name}.
- Return the result of {func(base, args, scope)}.

ValidatePipeFuncCall():

- Let {base} be the first {Expression}.
- Execute {Validate(base)}.
- Let {name} be the string value of the {Identifier} of the {FuncCall}.
- If there is no pipe function named {name}:
  - Stop and report an error.
- Let {args} be an array of the {Expression}s in the {FuncCallArgs} of the {FuncCall}.
- Let {validator} be the validator for the pipe function under the name {name}.
- Execute {validator(args)}.
