Pipe functions
-------

# Pipe functions

Pipe functions provide additional functionalty to GROQ queries. They are invoked through a [Pipe function call expression](#sec-Pipe-function-call-expression). They differ from regular functions in that they always accept an array as input and returns another array (or {null}). As such, the syntax is optimized for chaining (the array it works on comes on the left-hand side instead of being argument):

```
*[_type == "person"] | order(name) | {age}
```

Note that function arguments are not evaluated eagerly, and it's up to the function to decide which scope the arguments are evaluated in. All definitions below take an array of nodes.

An implementation may provide additional pipe functions, but should be aware that this can cause problems when interopting with future versions of GROQ.

## order

The order function sorts an array based on arbitrary expressions.

order(base, args, scope):

* Let {cmp }be a function which takes two arguments and returns either {Less}, {Equal} or {Greater}.
* Define {cmp(left, right)} as follows:
  * Let {leftScope} be the result of {NewNestedScope(left, scope)}.
  * Let {rightScope} be the result of {NewNestedScope(right, scope)}.
  * For each {argNode} of {args}:
      * Let {direction} be {Normal}.
    * Let {valueNode} be {argNode}.
    * If {valueNode} is an {Asc }operator:
          * Set {valueNode} to be the Expression of the Asc operator.
    * Else if {valueNode} is a {Desc} operator:
          * Set direction to {Reverse}.
      * Set {valueNode} to be the Expression of the {Desc} operator.
    * Let {leftValue} be the result of {Evaluate(valueNode, leftScope)}.
    * Let {rightValue} be the result of {Evaluate(valueNode, rightScope)}.
    * Let {order} be the result of {TotalCompare(leftValue, rightValue)}.
    * If {direction }is {Reverse} and {order} is {Less}:
          * Set {order} to {Greater}.
    * Else if {direction} is {Reverse} and {order} is {Greater}:
          * Set {order} to {Less}.
    * If {order} is not {Equal}:
          * Return {order}.
  * Return {Equal}.
* Return a sorted array using {cmp} as the comparator function.

orderValidate(args):

* If the length of {args} is 0:
  * Report an error.

