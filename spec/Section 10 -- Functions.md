Functions
-------

# Functions

Functions provide additional functionalty to GROQ queries. They are invoked through a [Function call expression](#sec-Function-call-expression). Note that function arguments are not evaluated eagerly, and it's up to the function to decide which scope the arguments are evaluated it. As such, all functions below take an array of nodes.

An implementation may provide additional functions, but should be aware that this can cause problems when interopting with future versions of GROQ.

## coalesce

The coalesce function returns the first value of the arguments which is not {null}.

coalesce(args, scope):

* For each {arg} in {args}:
  * Let {value} be the result of {Evaluate(arg, scope)}.
  * If {value} is not {null}:
      * Return {value}.
* Return {null}.

## count

The count function returns the length of an array.

count(args, scope):

* If the length of {args} is not 1:
  * Return {null}.
* Let {baseNode} be the first element of {args}.
* Let {base} be the result of {Evaluate(baseNode, scope)}.
* If {base} is an array:
  * Return the length of {base}.
* Otherwise:
  * Return {null}.

countValidate(args):

* If the length of {args} is not 1:
  * Report an error.

## dateTime

The `dateTime` function takes a string, returning a datetime value.

dateTime(args, scope):

* Let {baseNode} be the first element of {args}.
* Let {base} be the result of {Evaluate(baseNode, scope)}.
* If {base} is a string:
  * Try to parse {base} as a datetime using the [RFC 3339](https://tools.ietf.org/html/rfc3339) timestamp format.
  * If the input is a valid datetime:
      * Return the datetime.
* Return {null}.

dateTimeValidate(args):

* If the length of {args} is not 1:
  * Report an error.

## defined

The defined function checks if the argument is not {null}.

defined(args, scope):

* Let {baseNode} be the first element of {args}.
* Let {base} be the result of {Evaluate(baseNode, scope)}.
* If {base} is {null}:
  * Return {false}.
* Otherwise:
  * Return {true}.

definedValidate(args):

* If the length of {args} is not 1:
  * Report an error.

## length

The length function returns the length of a string or an array.

length(args, scope):

* Let {baseNode} be the first element of {args}.
* Let {base} be the result of {Evaluate(baseNode, scope)}.
* If {base} is a string:
  * Return the length of {base}.
* If {base} is an array:
  * Return the length of {base}.
* Return {null}.

lengthValidate(args):

* If the length of {args} is not 1:
  * Report an error.

## references

The references function implicitly takes this value of the current scope and recursively checks whether it contains any references to the given document ID.

references(args, scope):

* Let {pathNode} be the first element of {args}.
* Let {path} be the result of {Evaluate(pathNode, scope)}.
* If {path} is not a string:
  * Return {false}.
* Let {base} be the this value of {scope}.
* Return the result of {HasReferenceTo(base, path)}.

HasReferenceTo(base, path):

* If {base} is an array:
  * For each {value} in {base}:
      * Let {result} be the result of {HasReferenceTo(value, base)}.
    * If {result} is {true}:
          * Return {true}.
  * Return {false}.
* If {base} is an object:
  * If {base} has an attribute "_ref":
      * Let {ref} be the value of the attribute "_ref" in {base}.
    * Return the result of {Equal(ref, path)}.
  * For each {key} and {value} in {base}:
      * Let {result} be the result of {HasReferenceTo(value, base)}.
    * If {result} is {true}:
          * Return {true}.
* Return {false}.

referencesValidate(args):

* If the length of {args} is not 1:
  * Report an error.

## round

The round function accepts a number and rounds it to a certain precision.

round(args, scope):

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

roundValidate(args):

* If the length of {args} is less than 1 or greater than 2:
  * Report an error.

## select

The select function chooses takes a variable number of arguments that are either pairs or any other type and iterates over them. When encountering a pair whose left-hand value evaluates to {true}, the right-hand value is returned immediately. When encountering a non-pair argument, that argument is returned immediately. Falls back to returning {null}.

select(args, scope):

* For each {arg} in {args}:
  * If {arg} is a {Pair}:
      * Let {condNode} be the first {Expression} of the {Pair}.
    * Let {resultNode} be the second {Expression} of the {Pair}.
    * Let {cond} be the result of {Evaluate(condNode, scope)}.
    * If {cond} is {true}:
          * Return the result of {Evaluate(resultNode, scope)}.
  * Otherwise:
      * Return the result of {Evaluate(arg, scope)}.

selectValidate(args):

* Let {seenDefault} be {false}.
* For each {arg} in {args}:
  * If {seenDefault} is {true}:
      * Report an error.
  * If {arg} is not a {Pair}:
      * Set {seenDefault} to {true}.

## string

The string function returns the string representation of scalar values or {null} for any other values.

string(args, scope):

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

stringValidate(args):

* If the length of {args} is not 1:
  * Report an error.

