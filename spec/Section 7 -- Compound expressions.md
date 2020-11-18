Compound expressions
-------

# Compound expressions

## Parenthesis expression

A parenthesis expression allows you to add parenthesis around another expression to control precedence of operators.

```groq
(1 + 2) * 3
~~~~~~~
```

Parenthesis : ( Expression )

EvaluateParenthesis(scope):

* Let {innerNode} be the {Expression}.
* Let {result} be the result of {Evaluate(innerNode, scope)}.
* Return {result}.

## Attribute access expression

An attribute access expression returns an attribute of an object.

```
person.name
      ~~~~~
      
person["Full Name"]
      ~~~~~~~~~~~~~
```

AttributeAccess :

* Expression `.` Identifier
* Expression `[` String `]`

Note: This expression is syntactially a subset of a filter expression.

EvaluateAttributeAccess(scope):

* Let {baseNode} be the {Expression}.
* Let {base} be the result of {Evaluate(baseNode, scope)}.
* If {base} is not an object, return {null}.
* Let {name} be the string value of {String} or {Identifier}.
* If {base} does not contain an attribute {name}, return {null}.
* Return the value of the attribute {name} in {base}.

## Element access expression

An element access expression returns an element stored in an array. The array is 0-indexed and a negative index accesses the array from the end (i.e. an index of -1 returns the last element; -2 refers to the second last element).

ElementAccess : Expression `[` Integer `]`

Note: This expression is syntactially a subset of a filter expression.

EvaluateElementAccess(scope):

* Let {baseNode} be the {Expression}.
* Let {base} be the result of {Evaluate(baseNode, scope)}.
* If {base} is not an array, return {null}.
* Let {idx} be the number value of {Integer}.
* If {idx} is negative, add the length of {base} to {idx}.
* If {idx} is still negative, return {null}.
* If {idx} is equal to or greater than the length of {base}, return {null}.
* Return the value stored at position {idx} in {base}.

## Slice expression

A slice expression returns a slice of an array.

```
people[0..10]
      ~~~~~~~
```

Slice : Expression `[` Range `]`

Note: This expression is syntactically a subset of a filter expression.

EvaluateSlice(scope):

* Let {baseNode} be the {Expression}.
* Let {base} be the result of {Evaluate(baseNode, scope)}.
* If {base} is not an array, return {null}.
* Process the left index:
  * Let {leftNode} be the left value of the {Range}.
  * Let {left} be the result of {Evaluate(leftNode, scope)}.
  * If {left} is not a number, return {null}.
  * If {left} is negative, add the length of {base} to {left}.
  * Clamp {left} between 0 and (the length of {base} minus 1).
* Process the right index:
  * Let {rightNode} be the right value of the {Range}.
  * Let {right} be the result of {Evaluate(rightNode, scope)}.
  * If {right} is not a number, return {null}.
  * If {right} is negative, add the length of {base} to {right}.
  * If the {Range} is exclusive, subtract one from {right}.
  * Clamp {right} between 0 and (the length of {base} minus 1).
* Let {result} be an array containing the elements of {base} from position {left} up to and including position {right}.
* Return {result}.

## Filter expression

A filter expression filters an array using another expression. 

```
*[_type == "person"]
 ~~~~~~~~~~~~~~~~~~~
```

Filter : Expression `[` Expression `]`

Note: If the second Expression is a string/integer/range literal, this is parsed as an attribute access/element access/slice expression instead.

EvaluateFilter(scope):

* Let {baseNode} be the first {Expression}.
* Let {base} be the result of {Evaluate(baseNode, scope)}.
* If {base} is not an array, return {base}.
* Let {filterNode} be the second {Expression}.
* Let {result} be a new empty array.
* For each element {value} in {baseValue}:
  * Let {elementScope} be the result of {NewNestedScope(value, scope)}.
  * Let {matched} be the result of {Evaluate(filterNode, elementScope)}.
  * If {matched} is {true}, append {value} to {result}.
* Return {result}.

## Projection expression

A projection expression iterates over an array and creates new objects for each element. 

```
*[_type == "person"]{name, "isLegal": age >= 18}
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

Projection : Expression `|`? Object

EvaluateProjection(scope):

* Let {baseNode} be the {Expression}.
* Let {base} be the result of {Evaluate(baseNode, scope)}.
* Let {objNode} be the {Object}.
* If {base} is not an array:
  * Let {elementScope} be the result of {NewNestedScope(base, scope)}.
  * Let {result} be the result of {Evaluate(objNode, elementScope)}.
* Otherwise:
  * Let {result} be a new empty array.
  * For each element {value} in {base}:
      * Let {elementScope} be the result of {NewNestedScope(value, scope)}.
    * Let {newValue} be the result of {Evaluate(objNode, elementScope)}.
    * Append {newValue} to {result}.
* Return {result}.

## Pipe function call expression

GROQ comes with a set of built-in pipe functions which provides additional features. Pipe functions always accepts an array on the left-hand side and returns another array, and the syntax is optimized for being able to chain it together with other compund expressions. See the ["Pipe functions"](#sec-Pipe-functions) for available functions.

```
*[_type == "person"] | order(name) | {age}
                     ~~~~~~~~~~~~~
```

PipeFuncCall : Expression `|` FuncCall

EvaluatePipeFuncCall(scope):

* Let {baseNode} be the first Expression.
* Let {base} be the result of {Evaluate(baseNode, scope)}.
* If {base} is not an array:
  * Return {null}.
* Let {name} be the string value of the {Identifier} of the {FuncCall}.
* Let {args} be an empty array.
* For each {Expression} in the {FuncCallArgs} of the {FuncCall}.
  * Let {argumentNode} be the {Expression}.
  * Append {argumentNode} to {args}.
* Let {func} be the pipe function defined under the name {name}.
* Return the result of {func(base, args, scope)}.

ValidatePipeFuncCall():

* Let {base} be the first {Expression}.
* Execute {Validate(base)}.
* Let {name} be the string value of the {Identifier} of the {FuncCall}.
* If there is no pipe function named {name}:
  * Stop and report an error.
* Let {args} be an array of the {Expression}s in the {FuncCallArgs} of the {FuncCall}.
* Let {validator} be the validator for the pipe function under the name {name}.
* Execute {validator(args)}.

