Operators
-------

# Operators

## Logical Operators

GROQ supports the usual logical operators: logical and, logical or, and logical not. Operands must be booleans or {null}. If evaluation of an operand yields an invalid type it will be coerced to {null}.

### Logical And

`&&` returns `true` if both operands are `true`, otherwise it returns `false` or `null`. The complete truth table is:

* {true} && {true} => {true}
* {true} && {false} => {false}
* {false} && {true} => {false}
* {false} && {false} => {false}
* {true} && {null} => {null}
* {false} && {null} => {false}
* {null} && {true} => {null}
* {null} && {false} => {false}
* {null} && {null} => {null}

### Logical Or

{||} returns {true} if either operand is {true}, otherwise it returns {false} or {null}. The complete truth table is:

* {true} || {true} => {true}
* {true} || {false} => {true}
* {false} || {true} => {true}
* {false} || {false} => {false}
* {true} || {null} => {true}
* {false} || {null} => {null}
* {null} || {true} => {true}
* {null} || {false} => {null}
* {null} || {null} => {null}

### Logical Not

`!` returns the logical negation of the unary right-hand operand. The complete truth table is:

* {!true} => {false}
* {!false} => {true}
* {!null} => {null}

## Comparison Operators

Comparison operators compare two values, returning {true} if the comparison holds or {false} otherwise. The operands must be of the same type (except for integers and floats which are interchangeable), otherwise the comparison returns {null} as usual for type conflicts. If any operand is {null}, the comparison returns {null}.

Comparisons are currently only supported for basic data types (booleans, integers, floats, and strings), comparison of other data types is currently undefined.

Equality comparisons (`==` and `!=`) have the following semantics:

* Booleans: identical logical truth values.
* Integers and floats: identical real number values.
* Strings: identical lengths and Unicode code points (case sensitive).
* Nulls: always yield `null`.

Ordered comparisons (>, <, >=, and <=) use the following order:

* Booleans: `true` is greater than `false`.
* Integers and floats: numerical order.
* Strings: numerical Unicode code point order (i.e. case-sensitive), compared character-by-character. For overlapping strings, shorter strings are ordered before longer strings.
* Nulls: always yield `null`.

### Equality

Returns {true} if the operands are considered equal.

### Inequality

Returns {true} if the operands are considered not equal.

### Greater Than

Returns {true} if the left-hand operand is greater than (ordered after) the right-hand operand.

### Lesser Than

Returns {true} if the left-hand operand is lesser than (ordered before) the right-hand operand.

### Greater Than or Equal

Returns {true} if the left-hand operand is considered greater than or equal to the right-hand operand.

### Lesser Than or Equal

Returns {true} if the left-hand operand is considered lesser than or equal to the right-hand operand.

### Compound Type Membership

Returns {true} if the left-hand operand is contained within the right-hand operand. The right-hand operand may be an array, range, or path.

If the right-hand operand is an array, the left-hand operand may be of any type. The left-hand operand is compared for equality (==) with each element of the array, returning {true} as soon as a match is found. If no match is found, it returns {null} if the array contains a {null} value, otherwise {false}.

If the right-hand operand is a range, the left-hand operand must be of the same type as the range endpoints. Returns {true} if the left-hand operand is ordered between the range endpoints, otherwise {false}.

If the right-hand operand is a path, the left-hand operand must be a string or path. Returns {true} if the left-hand operand is matched by the right-hand path pattern, otherwise {false}.

## Access Operators

Access operators are used to access members of compound types, e.g. object attributes or array elements, returning {null} if the member does not exist or the operator is incompatible with the left-hand operand's type. Access operators can be chained, where each operator accesses the result of the preceding chain, e.g. `object.ref->array[1]`.

A handful of access operators, namely `*`, `^`, and `@`, do not take any operands and instead simply return the appropriate value. As such, they can only be used at the beginning of access expressions.

### Everything

Takes no operands, and returns an array of all stored documents that the current user has access to. It is typically used at the beginning of a GROQ query pipeline, such as `*[_type == "movie"]{title, releaseYear}`.

Note: Not to be confused with the `*` multiplication operator, which takes two operands (the factors to be multiplied).

### This

Takes no operands, and returns the root value of the current scope, or {null} if no root value exists. For example, in the document filter `*[@.attribute == "value"]` it refers to the currently filtered document, and in the expression `numbers[@ >= 10]` it refers to the currently filtered number of the `numbers` array.

### Parent

Takes no operands, and returns the root value of the parent scope, or `null` if no parent scope exists. For example, in the following query it refers to the projected document, not the document passed from the inner `*`:

```groq
*{ "referencedBy": *[ references(^._id) ]}
```

### Object Attribute Access

Returns the value of the object attribute given by the right-hand identifier, e.g. `object.attribute`.

### Object Attribute Access

Returns the object attribute with the given key, e.g. `object["attribute"]`. This is equivalent to the `.` access operator, but useful when the attribute name is not a legal GROQ identifier.

Note: The attribute name must be a string literal due to parser ambiguity with filters.

### Reference Access

Returns the document referenced by the left-hand reference, e.g. `ref->`. It may optionally be followed by an attribute identifier, in which case it returns the value of the given attribute of the referenced document, e.g. `ref->attribute`. If the reference points to a non-existent document (for a weak reference) it returns `null`.

### Array Element Access

Returns the array element at the given zero-based index, e.g. `array[2]` yields the third array element. Negative indices are based at the end of the array, e.g. `array[-2]` yields the second-to-last element.

Note: The element index must be an integer literal due to parser ambiguity with filters.

### Array Slice

Returns a new array containing the elements whose indices fall within the range, e.g. `array[2..4]` yields the new array `[array[2], array[3], array[4]]`. Ranges may extend beyond array bounds.

Negative range endpoints are based at the end of the array, e.g. `array[2..-1]` yields all elements from the third to the last. If the right endpoint falls before the left endpoint the result is an empty array.

Note: The range must be a range literal due to parser ambiguity with filters.

### Array Filter

Returns a new array with the elements for which the filter expression evaluates to `true`, e.g. `people[birthYear >= 1980]`.The filter is evaluated in the scope of each array element.

### Array Traversal

Traverses the left-hand array, applying the optional right-hand access operator to each element and collecting the resulting values in a flat array - e.g. `array[].attribute`yields a flat array of the `attribute` attribute value of each array element, and `array[]->name` yields a flat array of the `name` attribute values of each document referenced by `array`. If no right-hand access operator is given, it defaults to returning a flat array containing each traversed element.

### Array/Object Expansion

Expands the right-hand array or object into the surrounding literal array or object, e.g. `[...[1,2], 3, ...[4,5]]` yields `[1,2,3,4,5]`, and `{...{"a":1},"b":2,{"c":3}}`yields `{"a":1,"b":2,"c":3}`.

## Arithmetic Operators

Arithmetic operators accept any combination of float and integer operands. If any operand is a float, or if the result has a non-zero fractional part, the result is a float; otherwise it is an integer.

The `+` operator is also used to concatenate two strings, arrays, or objects.

Note: Floating point arithmetic is fundamentally imprecise, so operations on floats may produce results with very small rounding errors, and the results may vary on different CPU architectures. For example, `3.14+1` yields `4.140000000000001`. The `round()` function can be used to round results.

### Addition and Concatenation

Adds two numbers, e.g. `3+2` yields `5`. Also acts as a prefix operator for positive numbers, e.g. `+3` yields `3`.

Also concatenates two strings, arrays, or objects, e.g. `"ab"+"cd"` yields `"abcd"`. If two objects have duplicate keys, the key from the right-hand object replaces the key from the left-hand one.

### Subtraction

Subtracts two numbers, e.g. `3-2` yields `1`. Also acts as a prefix operator for negative numbers, e.g. `-3`.

### Multiplication

Multiplies two numbers, e.g. `3*2` yields `6`.

### Division

Divides two numbers, e.g. `3/2` yields `1.5`. Division by `0` yields `null`.

### Exponentiation

Raises the left-hand operand to the power of the right-hand operand, e.g. `2**3` yields `8`.

Fractional and negative exponents follow the normal rules of roots and inverse exponentiation, so e.g. the square root of `4` is taken with `4**(1/2)` (yielding `2`), and the inverse square root of `4` is taken with `4**-(1/2)` (yielding `0.5`).

### Modulo

Returns the remainder of the division of its operands, e.g. `5%2` yields `1`. The remainder has the sign of the dividend and a magnitude less than the divisor.

## Full-Text Search Operators

Full-text search operators perform searches of text content using inverted search indexes. Content is tokenized as words (i.e. split on whitespace and punctuation), with no stemming or other processing.

### Full-text Search

Searches the left-hand operand for individual words that match the text pattern given in the right-hand operand, returning `true` if a match is found, otherwise `false` if the right-hand operand does not contain `null` or `null` if it does.

Patterns are strings that use `*` as wildcards, and any number of wildcards can be used at any position. For example, `foo*` matches any word starting with `foo`, and `foo*bar`matches any word starting with `foo` and ending with `bar`. If the pattern does not contain any wildcards it must exactly match a whole word in the left-hand operand.

Both the left-hand and right-hand operands can be either strings or arrays of strings. All patterns in the right-hand operand must match anywhere in the left-hand operand, e.g. `["foobar", "baz"] match ["foo*", "*bar"]` returns `true`.

## Pipeline Operators

Pipelines are a calling convention where a left-hand array is passed to a right-hand pipeline expression. Pipelines are constructed via the `|` operator, which may be implicit. 

### Pipe Operator

Passes the left-hand array to the right-hand pipeline expression and returns the result, e.g. `* | order(_id)`.

## Operator Precedence

Operator precedence is listed below, in descending order and with associativity in parenthesis:

* `.` (left), `|` (left)
* `->` (left)
* `**` (right)
* `*` (left), `/` (left), `%` (left)
* `+` (left), `-` (left), `!` (right)
* `...` (right)
* == , !=, >, >=, <, <= (all left), in (left), match (left)
* `&&` (left)
* `||` (left)
* `*` (none), `@` (none), `^` (none)

Precedence can be overridden by grouping expressions with `()`, e.g. `(1+2)*3`.

