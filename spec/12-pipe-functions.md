# Pipe functions

Pipe functions provide additional functionality to GROQ queries. They are invoked through a [Pipe function call expression](#sec-Pipe-function-call-expression). They differ from regular functions in that they always accept an array as input and returns another array (or {null}). As such, the syntax is optimized for chaining (the array it works on comes on the left-hand side instead of being an argument):

```example
*[_type == "person"] | order(name) | {age}
```

Note that function arguments are not evaluated eagerly, and it's up to the function to decide which scope the arguments are evaluated in. All definitions below take an array of nodes.

An implementation may provide additional pipe functions, but should be aware that this can cause problems when interoperating with future versions of GROQ.

## global::order()

The order function sorts an array based on arbitrary expressions.

order(base, args, scope):

- Let {cmp} be a function which takes two arguments and returns either {Less}, {Equal} or {Greater}.
- Define {cmp(left, right)} as follows:
  - Let {leftScope} be the result of {NewNestedScope(left, scope)}.
  - Let {rightScope} be the result of {NewNestedScope(right, scope)}.
  - For each {argNode} of {args}:
    - Let {direction} be {Normal}.
    - Let {valueNode} be {argNode}.
    - If {valueNode} is an {Asc} operator: \* Set {valueNode} to be the Expression of the {Asc} operator.
    - Else if {valueNode} is a {Desc} operator: \* Set direction to {Reverse}.
      - Set {valueNode} to be the Expression of the {Desc} operator.
    - Let {leftValue} be the result of {Evaluate(valueNode, leftScope)}.
    - Let {rightValue} be the result of {Evaluate(valueNode, rightScope)}.
    - Let {order} be the result of {TotalCompare(leftValue, rightValue)}.
    - If {direction} is {Reverse} and {order} is {Less}: \* Set {order} to {Greater}.
    - Else if {direction} is {Reverse} and {order} is {Greater}: \* Set {order} to {Less}.
    - If {order} is not {Equal}: \* Return {order}.
  - Return {Equal}.
- Return a sorted array using {cmp} as the comparator function.

order_validate(args):

- If the length of {args} is 0:
  - Report an error.

## global::score()

The `score` function assigns a score to an array of results, based on one or more scoring expressions. The `score` function may only be used as a pipe function.

```example
*[_type == "listing"] | score(body match "jacuzzi")
```

In this query, anything where `body match "jacuzzi"` returns true will be scored higher than other results. Multiple expressions can be used:

```example
*[_type == "listing"] | score(body match "jacuzzi", bedrooms > 2, available && !inContract)
```

When multiple expressions are provided, the scores are merged into a single score for each result (see [score evaluation](#sec-Score-evaluation))

Only predicate expressions — that is, expressions that evaluate to a single boolean value or to `null` — may be used, including `boost()`. However, an implementation can put further constraints on which expressions are permitted as a score expression for optimization purposes.

Each score is assigned to the result as the new attribute `_score`, set to a positive number.

Scoring is additive. That is `* | score(a == 1) | score(b == 2)` is equivalent to `* | score(a == 1, b == 2)`.

score(base, args, scope):

- Let {baseNode} be the {Expression}.
- Let {base} be the result of {Evaluate(baseNode, scope)}.
- If {base} is an array:
  - Let {result} be an empty {Array}.
  - For each {element} of {base}:
    - If {element} is an object:
      - Let {elementScope} be the result of {NewNestedScope(element, scope)}.
      - Let {newElement} be a new empty {Object}.
      - Add the attributes from {element} to it.
      - If {element} already has a `_score`:
        - Let {scoreSum} be the current value of `_score`.
        - Otherwise let {scoreSum} be 1.0.
      - For each {predicateNode} of {args}:
        - Let {scoreValue} be the result of {EvaluateScore(predicateNode, elementScope)}.
        - Add {scoreValue} to {scoreSum}.
      - Add the attribute `_score` set to {scoreSum}.
      - Add {newElement} to {result}.
    - Otherwise add {element} to {result}.
  - Return {result} sorted by the score, in descending order.
- Return {null}.

EvaluateScore(expr, scope):

- Let {evaluator} be the score evaluator of {expr}.
- Return the result of {evaluator(scope)}.

score_validate(args):

- If the length of {args} is 0:
  - Report an error.
