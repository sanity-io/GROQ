Simple expressions
-------

# Simple expressions

## This expression

A this expression returns the this value of the current scope.

```groq
*[_id == "doc"][0].numbers[@ >= 10]
                           ~
```

This : `@`

EvaluateThis(scope):

* Return the this value of {scope}.

## This attribute expression

A *this attribute expression *returns an attribute from the this value of the current scope.

```
*[_id == "document"][name == "Michael Bluth"]
  ~~~                ~~~~
```

ThisAttribute : Identifier

EvaluateThisAttribute(scope):

* Let {base} be the this value of {scope}.
* Let {name} be the string value of the {Identifier}.
* If {base} is not an object, return {null}.
* If {base} does not contain an attribute {name}, return {null}.
* Return the value of the attribute {name} in {base}.

## Everything expression

An everything expression returns the full dataset.

```
*[_type == "person"]
~
```

Everything : `*`

EvaluateEverything(scope):

* Let {context} be the query context of {scope}.
* Return the dataset of {context}.

## Parent expression

A parent expression returns a this value for an upper scope.

```
// Find all people who have a cool friend
*[_type == "person" && *[_id == ^.friend._ref][0].isCool]
                                ~
```

Parent :

* `^`
* `^.` Parent

EvaluateParent(scope):

* Let {level} be the number of `^` in the parent expression.
* Let {currentScope} be {scope}.
* While {level} is greater than zero:
  * Set {currentScope} to the parent of {currentScope}. 
  * If {currentScope} is now {null}, return {null}.
  * Decrease {level} by one.
* Return the this value of {currentScope}.

## Function call expression

GROQ comes with a set of built-in functions which provides additional features. See the ["Functions"](#sec-Functions) for available functions and their namespaces.

```
*{"score": round(score, 2)}
           ~~~~~~~~~~~~~~~

*{"description": global::lower(description)}
                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

FuncCall : FuncNamespace? FuncIdentifier ( FuncCallArgs )

FuncNamespace : Identifier "::"

FuncIdentifier : Identifier

FuncCallArgs :

* Expression
* FuncCallArgs , Expression

EvaluateFuncCall(scope):

* Let {namespace} be the string value of the {FuncNamespace}.
* Let {name} be the string value of the {FuncIdentifier}.
* Let {args} be an empty array.
* For each {Expression} in {FuncCallArgs}:
  * Let {argumentNode} be the {Expression}.
  * Append {argumentNode} to {args}.
* Let {func} be the function defined under the name {name} in either {namespace} namespace if provided, or the `global` namespace.
* Return the result of {func(args, scope)}.

ValidateFuncCall():

* Let {namespace} be the string value of the {FuncNamespace}.
* If there is no namespace named {namespace}:
  * Stop and report an error.
* Let {name} be the string value of the {FuncIdentifier}.
* If there is no function named {name} defined in either {namespace} namespace if provided, or  the `global` namespace:
  * Stop and report an error.
* Let {args} be an array of the {Expression}s in {FuncCallArgs}.
* Let {validator} be the validator for the function under the name {name}.
* Execute {validator(args)}.
