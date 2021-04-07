Functions
-------

# Functions

Functions provide additional functionality to GROQ queries. They are invoked through a [Function call expression](#sec-Function-call-expression). Note that function arguments are not evaluated eagerly, and it's up to the function to decide which scope the arguments are evaluated it. As such, all functions below take an array of nodes.

An implementation may provide additional functions, but should be aware that this can cause problems when interopting with future versions of GROQ.

# Namespaces

Functions are namespaced which allows to group functions by logical scope. A function may be associated with multiple namespaces and behave differently. When a function is called without a namespace, it is by default associated with a "**global**" namespace.

## Global namespace

### global::coalesce()

The coalesce function returns the first value of the arguments which is not {null}.

global::coalesce(args, scope):

* For each {arg} in {args}:
  * Let {value} be the result of {Evaluate(arg, scope)}.
  * If {value} is not {null}:
    * Return {value}.
* Return {null}.

### global::count()

The count function returns the length of an array.

global::count(args, scope):

* Let {baseNode} be the first element of {args}.
* Let {base} be the result of {Evaluate(baseNode, scope)}.
* If {base} is an array:
  * Return the length of {base}.
* Otherwise:
  * Return {null}.

global::countValidate(args):

* If the length of {args} is not 1:
  * Report an error.

### global::dateTime()

The `dateTime` function takes a string or another datatime value, returning a datetime value. This function is idempotent.

global::dateTime(args, scope):

* Let {baseNode} be the first element of {args}.
* Let {base} be the result of {Evaluate(baseNode, scope)}.
* If {base} is a string:
  * Try to parse {base} as a datetime using the [RFC 3339](https://tools.ietf.org/html/rfc3339) timestamp format.
  * If the input is a valid datetime:
    * Return the datetime.
* If {base} is a datetime value:
  * Return {base}.
* Return {null}.

global::dateTimeValidate(args):

* If the length of {args} is not 1:
  * Report an error.

### global::defined()

The defined function checks if the argument is not {null}.

global::defined(args, scope):

* Let {baseNode} be the first element of {args}.
* Let {base} be the result of {Evaluate(baseNode, scope)}.
* If {base} is {null}:
  * Return {false}.
* Otherwise:
  * Return {true}.

global::definedValidate(args):

* If the length of {args} is not 1:
  * Report an error.

### global::length()

The length function returns the length of a string or an array.

global::length(args, scope):

* Let {baseNode} be the first element of {args}.
* Let {base} be the result of {Evaluate(baseNode, scope)}.
* If {base} is a string:
  * Return the length of {base}.
* If {base} is an array:
  * Return the length of {base}.
* Return {null}.

global::lengthValidate(args):

* If the length of {args} is not 1:
  * Report an error.

### global::references()

The references function implicitly takes this value of the current scope and recursively checks whether it contains any references to the given document ID.

global::references(args, scope):

* Let {pathSet} be an empty array.
* For each {arg} of {args}:
  * Let {path} be the result of {Evaluate(arg, scope)}.
  * If {path} is a string:
    * Append {path} to {pathSet}.
  * If {path} is an array:
    * Concatenate all strings of {path} to {pathSet}.
* If {pathSet} is empty:
  * Return {false}.
* Let {base} be the this value of {scope}.
* Return the result of {HasReferenceTo(base, pathSet)}.

global::HasReferenceTo(base, pathSet):

* If {base} is an array:
  * For each {value} in {base}:
    * Let {result} be the result of {HasReferenceTo(value, pathSet)}.
    * If {result} is {true}:
      * Return {true}.
  * Return {false}.
* If {base} is an object:
  * If {base} has an attribute "_ref":
    * Let {ref} be the value of the attribute "_ref" in {base}.
    * If {ref} exists in {pathSet}:
      * Return {true}.
    * Otherwise:
      * Return {false}.
  * For each {key} and {value} in {base}:
    * Let {result} be the result of {HasReferenceTo(value, pathSet)}.
    * If {result} is {true}:
      * Return {true}.
* Return {false}.

global::referencesValidate(args):

* If the length of {args} is 0:
  * Report an error.

### global::round()

The round function accepts a number and rounds it to a certain precision.

global::round(args, scope):

* Let {numNode} be the first element of {args}.
* Let {num} be the result of {Evaluate(numNode, scope)}.
* If {num} is not a number:
  * Return {null}.
* If the length of {args} is 2:
  * Let {precNode} be the second element of {args}.
  * Let {prec} be the result of {Evaluate(precNode, scope)}.
  * If {prec} is not a number:
    * Return {null}.
* Otherwise:
  * Let {prec} be 0.
* Return {num} rounded to {prec} number of digits after the decimal point.

global::roundValidate(args):

* If the length of {args} is less than 1 or greater than 2:
  * Report an error.

### global::select()

The select function chooses takes a variable number of arguments that are either pairs or any other type and iterates over them. When encountering a pair whose left-hand value evaluates to {true}, the right-hand value is returned immediately. When encountering a non-pair argument, that argument is returned immediately. Falls back to returning {null}.

global::select(args, scope):

* For each {arg} in {args}:
  * If {arg} is a {Pair}:
    * Let {condNode} be the first {Expression} of the {Pair}.
    * Let {resultNode} be the second {Expression} of the {Pair}.
    * Let {cond} be the result of {Evaluate(condNode, scope)}.
    * If {cond} is {true}:
      * Return the result of {Evaluate(resultNode, scope)}.
  * Otherwise:
    * Return the result of {Evaluate(arg, scope)}.

global::selectValidate(args):

* Let {seenDefault} be {false}.
* For each {arg} in {args}:
  * If {seenDefault} is {true}:
    * Report an error.
  * If {arg} is not a {Pair}:
    * Set {seenDefault} to {true}.

### global::string()

The string function returns the string representation of scalar values or {null} for any other values.

global::string(args, scope):

* Let {node} be the first element of {args}.
* Let {val} be the result of {Evaluate(node, scope)}.
* If {val} is {true}:
  * Return the string `"true"`
* If {val} is {false}:
  * Return the string `"false"`
* If {val} is a string:
  * Return {val}.
* If {val} is a number:
  * Return a string representation of the number.
* If {val} is a datetime:
  * Return the datetime in the [RFC 3339](https://tools.ietf.org/html/rfc3339) timestamp format with a Z suffix.
* Otherwise:
  * Return {null}.

global::stringValidate(args):

* If the length of {args} is not 1:
  * Report an error.

### global::boost()

The `boost` function accepts an expression and a boost value, and increases or decreases the score computed by `score()` (see ["Pipe functions"](#sec-Pipe-functions)) accordingly. `boost` can only be used within the argument list to `score()`.

```groq
* | score(boost(title matches "milk", 5.0), body matches "milk")
```

The expression must be a predicate expressions that evaluates to a single boolean value. Any other result value is ignored.

The value argument must be a number >= 0.

The return value is the same as the input predicate. Internally, the scoring execution model uses the provided boost value to increase the computed score if the predicate matches.

boost(args, scope):

* Let {predicateNode} be the first element of {args}.
* Let {result} be the result of {Evaluate(predicateNode, scope)}.
* Let {numNode} be the second element of {args}.
* Let {num} be the result of {Evaluate(numNode, scope)}.
* If {num} is not a number:
  * Return {null}.
* If {num} is negative:
  * Return {null}.
* Return {result}.

boostValidate(args):

* If the length of {args} is not 2:
  * Report an error.

### global::lower()

The lower function returns lowercased string.

global::lower(args, scope):

* Let {value} be the result of {Evaluate(arg, scope)}.
* If {value} is not {null}:
  * Return lowercase form of {value}.
* Return {null}.

global::lowerValidate(args):

* If the length of {args} is not 1:
  * Report an error.

### global::upper()

The upper function returns uppercased string.

global::upper(args, scope):

* Let {value} be the result of {Evaluate(arg, scope)}.
* If {value} is not {null}:
  * Return uppercase form of {value}.
* Return {null}.

global::upperValidate(args):

* If the length of {args} is not 1:
  * Report an error.

In addition to the functions mentioned above, constructors for [extensions](#sec-Extensions) are global as well.
