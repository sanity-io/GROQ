# Compound expressions

## Parenthesis expression

A parenthesis expression allows you to add parenthesis around another expression to control precedence of operators.

```groq
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

```groq
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

GROQ comes with a set of built-in pipe functions which provides additional features. Pipe functions always accepts an array on the left-hand side and returns another array, and the syntax is optimized for being able to chain it together with other compund expressions. See the ["Pipe functions"](#sec-Pipe-functions) for available functions.

```
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

# Traversal operators

## Attribute access traversal

An attribute access returns an attribute of an object.

```
person.name
      ~~~~~

person["Full Name"]
      ~~~~~~~~~~~~~
```

AttributeAccess :

- `.` Identifier
- `[` Expression `]`

Note: {Filter}, {ElementAccess}, {AttributeAccess} are syntactically ambiguous. See ["Disambiguating square backet traversal"](#sec-Disambiguating-square-backet-traversal) for how to disambiguate between them.

EvaluateAttributeAccess(base, scope):

- If {base} is not an object, return {null}.
- Let {name} be the string value of {String} or {Identifier}.
- If {base} does not contain an attribute {name}, return {null}.
- Return the value of the attribute {name} in {base}.

## Element access traversal

An element access returns an element stored in an array. The array is 0-indexed and a negative index accesses the array from the end (i.e. an index of -1 returns the last element; -2 refers to the second last element).

ElementAccess : `[` Expression `]`

Note: {Filter}, {ElementAccess}, {AttributeAccess} are syntactically ambiguous. See ["Disambiguating square backet traversal"](#sec-Disambiguating-square-backet-traversal) for how to disambiguate between them.

EvaluateElementAccess(base, scope):

- If {base} is not an array, return {null}.
- Let {idxNode} be the second {Expression}.
- Let {idx} be the result of {Evaluate(idxNode, scope)}.
  This value is guaranteed to be an integer due to the validation.
- If {idx} is negative, add the length of {base} to {idx}.
- If {idx} is still negative, return {null}.
- If {idx} is equal to or greater than the length of {base}, return {null}.
- Return the value stored at position {idx} in {base}.

ValidateElementAccess():

- Let {idxNode} be the second {Expression}.
- Let {idx} be the result of {ConstantEvaluate(idxNode)}.
  This value is guaranteed to be a number due to square bracket disambiguation.
- If {idx} is not an integer: Report an error.

## Slice traversal

A slice returns a slice of an array.

```
people[0..10]
      ~~~~~~~
```

Slice : `[` Range `]`

EvaluateSlice(base, scope):

- Let {base} be the result of {Evaluate(baseNode, scope)}.
- If {base} is not an array, return {null}.
- Process the left index:
  - Let {leftNode} be the left value of the {Range}.
  - Let {left} be the result of {Evaluate(leftNode, scope)}.
    This value is guaranteed to be an integer due to the validation.
  - If {left} is negative, add the length of {base} to {left}.
  - Clamp {left} between 0 and (the length of {base} minus 1).
- Process the right index:
  - Let {rightNode} be the right value of the {Range}.
  - Let {right} be the result of {Evaluate(rightNode, scope)}.
    This value is guaranteed to be an integer due to the validation.
  - If {right} is negative, add the length of {base} to {right}.
  - If the {Range} is exclusive, subtract one from {right}.
  - Clamp {right} between 0 and (the length of {base} minus 1).
- Let {result} be an array containing the elements of {base} from position {left} up to and including position {right}.
- Return {result}.

ValidateSlice():

- Let {leftNode} be the left value of the {Range}.
- Let {leftValue} be the result of {ConstantEvaluate(leftNode)}.
- If {leftValue} is not an integer: Report an error.
- Let {rightNode} be the right value of the {Range}.
- Let {rightValue} be the result of {ConstantEvaluate(rightNode)}.
- If {rightValue} is not an integer: Report an error.

## Filter traversal

A filter returns an array filtered another expression.

```
*[_type == "person"]
 ~~~~~~~~~~~~~~~~~~~
```

Filter : `[` Expression `]`

Note: {Filter}, {ElementAccess}, {AttributeAccess} are syntactically ambiguous. See ["Disambiguating square backet traversal"](#sec-Disambiguating-square-backet-traversal) for how to disambiguate between them.

EvaluateFilter(base, scope):

- If {base} is not an array, return {base}.
- Let {filterNode} be the second {Expression}.
- Let {result} be a new empty array.
- For each element {value} in {baseValue}:
  - Let {elementScope} be the result of {NewNestedScope(value, scope)}.
  - Let {matched} be the result of {Evaluate(filterNode, elementScope)}.
  - If {matched} is {true}, append {value} to {result}.
- Return {result}.

## Array postfix traversal

An array postfix coerces the value into an array.

ArrayPostfix : `[` `]`

EvaluateArrayPostfix(base, scope):

- If {base} is not an array, return {null}.
- Return {base}.

## Projection traversal

A projection operator returns a new object.

```
*[_type == "person"]{name, "isLegal": age >= 18}
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

Projection : `|`? Object

EvaluateProjection(base, scope):

- Let {objNode} be the {Object}.
- If {base} is not an object:
  - Return {null}.
- Let {elementScope} be the result of {NewNestedScope(base, scope)}.
- Let {result} be the result of {Evaluate(objNode, elementScope)}.
- Return {result}.

## Dereference traversal

Dereference : `->` String?

EvaluateDereference(base, scope):

- If {base} is not an object:
  - Return {null}.
- If {base} does not have an attribute `_ref`:
  - Return {null}.
- Let {ref} be the value of the attribute `_ref` in {base}.
- If {ref} is not a string:
  - Return {null}.
- Let {dataset} be the dataset of the query context of {scope}.
- If {dataset} is not an array:
  - Return {null}.
- Let {result} be {null}.
- For each {document} in {dataset}:
  - If {document} is an object and has an attribute `_id`:
    - Let {id} be the value of the attribute `_id` in {document}.
    - If {Equal(ref, id)} is {true}:
      - Set {result} to {document}.
      - Stop the loop.
- If the dereference expression contains a {String}:
  - Let {name} be the string value of the {String}.
  - If {result} is an object and contains an attribute {name}:
    - Return the {value} of the attribute {name} in {result}.
  - Otherwise:
    - Return {null}.
- Return {result}.

## Disambiguating square backet traversal

{Filter}, {ElementAccess} and {AttributeAccess} are syntactically ambiguous, and the following algorithm is used to disambiguate between them.

SquareBracketTraversal : `[` Expression `]`

DisambiguateSquareBracketTraversal():

- Let {valueNode} be the {Expression}.
- Let {value} be the result of {ConstantEvaluate(valueNode)}.
- If {value} is a string: Interpret it as an {AttributeAccess} traversal.
- If {value} is a number: Interpret it as an {ElementAccess} traversal.
- Otherwise: Interpret it as a {Filter} traversal.
