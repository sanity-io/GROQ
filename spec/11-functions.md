# Functions

Functions provide additional functionality to GROQ queries. They are invoked through a [Function call expression](#sec-Function-call-expression). Note that function arguments are not evaluated eagerly, and it's up to the function to decide which scope the arguments are evaluated it. As such, all functions below take an array of nodes.

An implementation may provide additional functions, but should be aware that this can cause problems when interoperating with future versions of GROQ.

Functions are namespaced which allows to group functions by logical scope. A function may be associated with multiple namespaces and behave differently. When a function is called without a namespace, it is by default associated with a "**global**" namespace.

## Global namespace

### global::after()

The after function, in delta mode, returns the attributes after the change.

global_after(args, scope):

- Return the after object of the query context of {scope}.

global_after_validate(args, scope):

- If the length of {args} is not 0:
  - Report an error.
- If the mode of the query context of {scope} is not "delta":
  - Report an error.

### global::before()

The before function, in delta mode, returns the attributes before the change.

global_before(args, scope):

- Return the before object of the query context of {scope}.

global_before_validate(args, scope):

- If the length of {args} is not 0:
  - Report an error.
- If the mode of the query context of {scope} is not "delta":
  - Report an error.

### global::coalesce()

The coalesce function returns the first value of the arguments which is not {null}.

global_coalesce(args, scope):

- For each {arg} in {args}:
  - Let {value} be the result of {Evaluate(arg, scope)}.
  - If {value} is not {null}:
    - Return {value}.
- Return {null}.

### global::count()

The count function returns the length of an array.

global_count(args, scope):

- Let {baseNode} be the first element of {args}.
- Let {base} be the result of {Evaluate(baseNode, scope)}.
- If {base} is an array:
  - Return the length of {base}.
- Otherwise:
  - Return {null}.

global_count_validate(args):

- If the length of {args} is not 1:
  - Report an error.

### global::dateTime()

The `dateTime` function takes a string or another datatime value, returning a datetime value. This function is idempotent.

global_dateTime(args, scope):

- Let {baseNode} be the first element of {args}.
- Let {base} be the result of {Evaluate(baseNode, scope)}.
- If {base} is a string:
  - Try to parse {base} as a datetime using the [RFC 3339](https://tools.ietf.org/html/rfc3339) timestamp format.
  - If the input is a valid datetime:
    - Return the datetime.
- If {base} is a datetime value:
  - Return {base}.
- Return {null}.

global_dateTime_validate(args):

- If the length of {args} is not 1:
  - Report an error.

### global::defined()

The defined function checks if the argument is not {null}.

global_defined(args, scope):

- Let {baseNode} be the first element of {args}.
- Let {base} be the result of {Evaluate(baseNode, scope)}.
- If {base} is {null}:
  - Return {false}.
- Otherwise:
  - Return {true}.

global_defined_validate(args):

- If the length of {args} is not 1:
  - Report an error.

### global::length()

The length function returns the length of a string or an array.

global_length(args, scope):

- Let {baseNode} be the first element of {args}.
- Let {base} be the result of {Evaluate(baseNode, scope)}.
- If {base} is a string:
  - Return the length of {base}.
- If {base} is an array:
  - Return the length of {base}.
- Return {null}.

global_length_validate(args):

- If the length of {args} is not 1:
  - Report an error.

### global::now()

The now function returns the current point in time as a string.

Note: This function returns a string due to backwards compatibility.
It's recommended to use `dateTime::now()` instead which returns a proper datetime.

global_now(args, scope):

- Let {ts} be a datetime representing the current point in time.
- Let {result} be a [RFC 3339](https://tools.ietf.org/html/rfc3339) string formatting of {ts}.
- Return {result}.

global_now_validate(args):

- If the length of {args} is not 0:
  - Report an error.

### global::operation()

The operation function returns the current operation ({"create"}, {"update"}, {"delete"}) of a change in delta mode.

global_operation(args, scope):

- Let {before} and {after} be the before/after objects of the query context to {scope}.
- If {before} is {null}:
  - Return {"create"}.
- If {after} is {null}:
  - Return {"delete"}.
- Return {"update"}.

global_operation_validate(args):

- If the length of {args} is not 0:
  - Report an error.

### global::references()

The references function implicitly takes this value of the current scope and recursively checks whether it contains any references to the given document ID.

global_references(args, scope):

- Let {pathSet} be an empty array.
- For each {arg} of {args}:
  - Let {path} be the result of {Evaluate(arg, scope)}.
  - If {path} is a string:
    - Append {path} to {pathSet}.
  - If {path} is an array:
    - Concatenate all strings of {path} to {pathSet}.
- If {pathSet} is empty:
  - Return {false}.
- Let {base} be the this value of {scope}.
- Return the result of {HasReferenceTo(base, pathSet)}.

HasReferenceTo(base, pathSet):

- If {base} is an array:
  - For each {value} in {base}:
    - Let {result} be the result of {HasReferenceTo(value, pathSet)}.
    - If {result} is {true}:
      - Return {true}.
  - Return {false}.
- If {base} is an object:
  - If {base} has an attribute `_ref`:
    - Let {ref} be the value of the attribute `_ref` in {base}.
    - If {ref} exists in {pathSet}:
      - Return {true}.
    - Otherwise:
      - Return {false}.
  - For each {key} and {value} in {base}:
    - Let {result} be the result of {HasReferenceTo(value, pathSet)}.
    - If {result} is {true}:
      - Return {true}.
- Return {false}.

global_references_validate(args):

- If the length of {args} is 0:
  - Report an error.

### global::round()

The round function accepts a number and rounds it to a certain precision.

global_round(args, scope):

- Let {numNode} be the first element of {args}.
- Let {num} be the result of {Evaluate(numNode, scope)}.
- If {num} is not a number:
  - Return {null}.
- If the length of {args} is 2:
  - Let {precNode} be the second element of {args}.
  - Let {prec} be the result of {Evaluate(precNode, scope)}.
  - If {prec} is not a number:
    - Return {null}.
- Otherwise:
  - Let {prec} be 0.
- Return {num} rounded to {prec} number of digits after the decimal point.

global_round_validate(args):

- If the length of {args} is less than 1 or greater than 2:
  - Report an error.

### global::select()

The select function chooses takes a variable number of arguments that are either pairs or any other type and iterates over them. When encountering a pair whose left-hand value evaluates to {true}, the right-hand value is returned immediately. When encountering a non-pair argument, that argument is returned immediately. Falls back to returning {null}.

global_select(args, scope):

- For each {arg} in {args}:
  - If {arg} is a {Pair}:
    - Let {condNode} be the first {Expression} of the {Pair}.
    - Let {resultNode} be the second {Expression} of the {Pair}.
    - Let {cond} be the result of {Evaluate(condNode, scope)}.
    - If {cond} is {true}:
      - Return the result of {Evaluate(resultNode, scope)}.
  - Otherwise:
    - Return the result of {Evaluate(arg, scope)}.

global_select_validate(args):

- Let {seenDefault} be {false}.
- For each {arg} in {args}:
  - If {seenDefault} is {true}:
    - Report an error.
  - If {arg} is not a {Pair}:
    - Set {seenDefault} to {true}.

### global::string()

The string function returns the string representation of scalar values or {null} for any other values.

global_string(args, scope):

- Let {node} be the first element of {args}.
- Let {val} be the result of {Evaluate(node, scope)}.
- If {val} is {true}:
  - Return the string `"true"`.
- If {val} is {false}:
  - Return the string `"false"`.
- If {val} is a string:
  - Return {val}.
- If {val} is a number:
  - Return a string representation of the number.
- If {val} is a datetime:
  - Return the datetime in the [RFC 3339](https://tools.ietf.org/html/rfc3339) timestamp format with a Z suffix.
- Otherwise:
  - Return {null}.

global_string_validate(args):

- If the length of {args} is not 1:
  - Report an error.

### global::boost()

The `boost` function accepts an expression and a boost value, and increases or decreases the score computed by `score()` (see ["Pipe functions"](#sec-Pipe-functions)) accordingly. `boost` can only be used within the argument list to `score()`.

```example
* | score(boost(title matches "milk", 5.0), body matches "milk")
```

The expression must be a predicate expressions that evaluates to a single boolean value. Any other result value is ignored.

The value argument must be a number >= 0.

The return value is the same as the input predicate. Internally, the scoring execution model uses the provided boost value to increase the computed score if the predicate matches.

boost(args, scope):

- Let {predicateNode} be the first element of {args}.
- Let {result} be the result of {Evaluate(predicateNode, scope)}.
- Let {numNode} be the second element of {args}.
- Let {num} be the result of {Evaluate(numNode, scope)}.
- If {num} is not a number:
  - Return {null}.
- If {num} is negative:
  - Return {null}.
- Return {result}.

boost_validate(args):

- If the length of {args} is not 2:
  - Report an error.

### global::lower()

The lower function returns lowercased string.

global_lower(args, scope):

- Let {value} be the result of {Evaluate(arg, scope)}.
- If {value} is not {null}:
  - Return lowercase form of {value}.
- Return {null}.

global_lower_validate(args):

- If the length of {args} is not 1:
  - Report an error.

### global::upper()

The upper function returns uppercased string.

global_upper(args, scope):

- Let {value} be the result of {Evaluate(arg, scope)}.
- If {value} is not {null}:
  - Return uppercase form of {value}.
- Return {null}.

global_upper_validate(args):

- If the length of {args} is not 1:
  - Report an error.

In addition to the functions mentioned above, constructors for [extensions](#sec-Extensions) are global as well.

## Date/time namespace

The `dateTime` namespace contains functions to work with datetimes.

### dateTime::now()

The now function in the `dateTime` namespace returns the current point in time as a datetime.

dateTime_now(args, scope):

- Let {result} be a datetime representing the current point in time.
- Return {result}.

dateTime_now_validate(args):

- If the length of {args} is not 0:
  - Report an error.

## Diff namespace

The diff namespace contains functionality for comparing objects.

### diff::changedAny()

The `changedAny` function in the `diff` namespace returns a boolean if any of the key paths matched by the selector are changed.

diff_changedAny(args, scope):

- Let {lhs} be the first element of {args}.
- Let {rhs} be the second element of {args}.
- Let {selector} be the third element of {args}.
- Let {before} be the result of {Evaluate(lhs, scope)}.
- Let {after} be the result of {Evaluate(rhs, scope)}.
- Let {selectedKeyPaths} be the result of {EvaluateSelector(selector, before, scope)}.
- Let {diffKeyPaths} be the list of key paths that are different in {before} and {after}.
- If {diffKeyPaths} overlaps with {selectedKeyPaths}:
  - Return {true}.
- Otherwise:
  - Return {false}.

diff_changedAny_validate(args):

- If the length of {args} is not 3:
  - Report an error.
- If the third element is not a {Selector}:
  - Report an error.

### diff::changedOnly()

The `changedOnly` function in the `diff` namespace returns a boolean if given two nodes only the given key paths matched by the selector are changed.

diff_changedOnly(args, scope):

- Let {lhs} be the first element of {args}.
- Let {rhs} be the second element of {args}.
- Let {selector} be the third element of {args}.
- Let {before} be the result of {Evaluate(lhs, scope)}.
- Let {after} be the result of {Evaluate(rhs, scope)}.
- Let {selectedKeyPaths} be the result of {EvaluateSelector(selector, before, scope)}.
- Let {diffKeyPaths} be the list of key paths that are different in {before} and {after}.
- If {diffKeyPaths} is a subset of {selectedKeyPaths}:
  - Return {true}.
- Otherwise:
  - Return {false}.

diff_changedOnly_validate(args):

- If the length of {args} is not 3:
  - Report an error.
- If the third element is not a {Selector}:
  - Report an error.

## Delta namespace

The `delta` namespace contains functions which are valid in delta mode.

### delta::changedAny

`delta::changedAny` is a variant of `diff::changedAny` which works on the before/after objects.

delta_changedAny(args, scope):

- Let {before} and {after} be the before/after objects of the query context to {scope}.
- Let {selector} by the first element of {args}.
- Let {result} be the result of {diff_changedAny(before, after, selector)}.
- Return {result}.

delta_changedAny_validate(args, scope):

- If the mode of the query context of {scope} is not "delta":
  - Report an error.
- If the first element is not a {Selector}:
  - Report an error.

### delta::changedOnly

`delta::changedOnly` is a variant of `diff::changedOnly` which works on the before/after objects.

delta_changedOnly(args, scope):

- Let {before} and {after} be the before/after objects of the query context to {scope}.
- Let {selector} by the first element of {args}.
- Let {result} be the result of {diff_changedOnly(before, after, selector)}.
- Return {result}.

delta_changedOnly_validate(args, scope):

- If the mode of the query context of {scope} is not "delta":
  - Report an error.
- If the first element is not a {Selector}:
  - Report an error.

## Array namespace

The `array` namespace contains functions to work with arrays.

### array::join()

The `join` function concatenates together the elements of an array into a single output string. Only primitive values supported by `global::string()` can be collected. Objects, arrays, etc. are considered composite values that cannot be joined.

array_join(args, scope):

- Let {arrNode} be the first element of {args}.
- Let {sepNode} be the second element of {args}.
- Let {arr} be the result of {Evaluate(arrNode, scope)}.
- Let {sep} be the result of {Evaluate(sepNode, scope)}.
- If {arr} is not an array:
  - Return {null}.
- If {sep} is not a string:
  - Return {null}.
- Let {output} be an empty string.
- For each element in {arr}:
  - Let {elem} be the element.
  - Let {index} be the index of the element.
  - If {index} is greater than or equal to 1, append {sep} to {output}.
  - Let {str} be the result of evaluating `global::string(elem)`.
  - If {str} is {null}:
    - Return {null}.
  - Otherwise:
    - Append {str} to {output}.
- Return {output}.

array_join_validate(args):

- If the length of {args} is not 2:
  - Report an error.

### array::compact()

The `compact` function filters null values from an array.

array_compact(args, scope):

- Let {arrNode} be the first element of {args}.
- Let {arr} be the result of {Evaluate(arrNode, scope)}.
- If {arr} is not an array:
  - Return null
- Let {output} be an empty array.
- For each element in {arr}:
  - Let {elem} be the element
  - If {elem} is not null:
    - Append {elem} to {output}.
- Return {output}.

array_compact_validate(args):

- If the length of {args} is not 1:
  - Report an error.

### array::unique()

The `unique` function filters duplicate values from an array.

Only values that can be compared for [equality](#sec-Equality) are compared for uniqueness.
All other values are considered individually unique. For example, `array::unique([[1], [1]])` should
return `[[1], [1]]`.

The algorithm below specifies a linear search, but since an implementation can choose to use
hashing or a similar non-order-preserving data structure for efficiency, the order of the output
cannot be guaranteed to be the same as the input.

array_unique(args, scope):

- Let {arrNode} be the first element of {args}.
- Let {arr} be the result of {Evaluate(arrNode, scope)}.
- If {arr} is not an array:
  - Return {null}.
- Let {output} be an empty array.
- For each element in {arr}:
  - Let {elem} be the element
  - Let {found} be false.
  - If {elem} is comparable (see above):
    - For each element in {arr}:
      - Let {b} be the element.
      - Set {found} be the result of `Equal(elem, b)`
      - If {found} is true:
        - Break loop
  - If {found} is false:
    - Add {elem} to {output} at any position.
- Return {output}.

array_unique_validate(args):

- If the length of {args} is not 1:
  - Report an error.

## String namespace

The `string` namespace contains functions to work with strings.

### string::split()

The `split` function splits a string into multiple strings, given a separator string.

string_split(args, scope):

- Let {strNode} be the first element of {args}.
- Let {sepNode} be the second element of {args}.
- Let {str} be the result of {Evaluate(strNode, scope)}.
- If {str} is not a string, return {null}.
- Let {sep} be the result of {Evaluate(sepNode, scope)}.
- If {sep} is not a string, return {null}.
- Let {output} be an empty array.
- If {sep} is an empty string:
  - Let {output} be each character of {str}, according to Unicode character splitting rules.
- Otherwise:
  - Let {output} be each substring of {str} as separated by {sep}. An empty string is considered a substring, and will be included when {sep} is present at the beginning, the end, or consecutively of {str}. For example, the string `,a,b,` when split by `,` will result in four substrings `['', 'a', 'b', '']`.
- Return {output}.

string_split_validate(args):

- If the length of {args} is not 2:
  - Report an error.

### string::startsWith()

The `startsWith` function evaluates whether a string starts with a given prefix.

string_startsWith(args, scope):

- Let {strNode} be the first element of {args}.
- Let {prefixNode} be the second element of {args}.
- Let {str} be the result of {Evaluate(strNode, scope)}.
- If {str} is not a string, return {null}.
- Let {prefix} be the result of {Evaluate(sepNode, scope)}.
- If {prefix} is not a string, return {null}.
- Let {n} be the length of {prefix}.
- If {n} is zero:
  - Return true.
- If the first {n} characters of {str} equal {prefix}:
  - Return true.
- Otherwise return false.

string_startsWith_validate(args):

- If the length of {args} is not 2:
  - Report an error.

## Math namespace

The `math` namespace contains functions for performing mathematical operations.

### math::sum()

The `sum` function computes the sum of all numbers in an array. {null} values are
ignored, but non-numbers cause the function to return {null}. If the array does not contain at least
one numeric value, it returns 0.

math_sum(args, scope):

- Let {arrNode} be the first element of {args}.
- Let {arr} be the result of {Evaluate(arrNode, scope)}.
- If {arr} is not an array, return {null}.
- Let {n} be zero.
- For each element {elem} in {arr}:
  - If {elem} is null:
    - Ignore it.
  - If {elem} is not a number:
    - Return {null}.
  - Otherwise:
    - Add {elem} to {n}.
- Return {n}.

math_sum_validate(args):

- If the length of {args} is not 1:
  - Report an error.

### math::avg()

The `avg` function computes the arithmetic mean of all numbers in an array. {null} values are
ignored, but non-numbers cause the function to return {null}. If the array does not contain at least
one numeric value, it returns {null}.

math_avg(args, scope):

- Let {arrNode} be the first element of {args}.
- Let {arr} be the result of {Evaluate(arrNode, scope)}.
- If {arr} is not an array, return {null}.
- Let {n} be zero.
- Let {count} be zero.
- For each element {elem} in {arr}:
  - If {elem} is null:
    - Ignore it.
  - If {elem} is not a number:
    - Return {null}.
  - Otherwise:
    - Increment {count}.
    - Add {elem} to {n}.
- If {count} is zero:
  - Return {null}.
- Return {n} divided by the {count}.

math_avg_validate(args):

- If the length of {args} is not 1:
  - Report an error.

### math::min()

The `min` function finds the smallest numeric value in an array. {null} values are
ignored, but non-numbers cause the function to return {null}. If the array does not contain at least
one numeric value, it returns {null}.

math_min(args, scope):

- Let {arrNode} be the first element of {args}.
- Let {arr} be the result of {Evaluate(arrNode, scope)}.
- If {arr} is not an array, return {null}.
- Let {min} be {null}.
- For each element {elem} in {arr}:
  - If {elem} is null:
    - Ignore it.
  - If {elem} is not a number:
    - Return {null}.
  - Otherwise:
    - If {min} is {null} or {PartialCompare(elem, min)} is {Lower}:
      - Set {min} to {elem}.
- Return {min}.

math_min_validate(args):

- If the length of {args} is not 1:
  - Report an error.

### math::max()

The `max` function finds the largest numeric value in an array. {null} values are
ignored, but non-numbers cause the function to return {null}. If the array does not contain at least
one numeric value, it returns {null}.

math_max(args, scope):

- Let {arrNode} be the first element of {args}.
- Let {arr} be the result of {Evaluate(arrNode, scope)}.
- If {arr} is not an array, return {null}.
- Let {max} be {null}.
- For each element {elem} in {arr}:
  - If {elem} is null:
    - Ignore it.
  - If {elem} is not a number:
    - Return {null}.
  - Otherwise:
    - If {max} is {null} or {PartialCompare(elem, max)} is {Greater}:
      - Set {max} to {elem}.
- Return {max}.

math_max_validate(args):

- If the length of {args} is not 1:
  - Report an error.
