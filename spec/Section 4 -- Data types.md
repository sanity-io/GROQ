Data types
-------

# Data types

## Null

An unknown value, expressed as {null}. This follows the SQL definition of null, which differs from the typical definition of "no value" in programming languages, and implies among other things that `1 + null` yields {null} (1 plus an unknown number yields an unknown number).

Null : null

## Boolean

Logical truth values, i.e. {true} and {false}.

Boolean :

* true
* false

## Number

Signed 64-bit double-precision floating point numbers, e.g. `3.14`, following the [IEEE 754 standard](https://en.wikipedia.org/wiki/Double-precision_floating-point_format). These have a magnitude of roughly 10⁻³⁰⁷ to 10³⁰⁸, and can represent 15 significant figures with exact precision - beyond this, significant figures are rounded to 53-bit precision. The special IEEE 754 values of {Infinity} and {NaN} are not supported, and are coerced to {null}.

Number :

* Integer
* Decimal
* ScientificNotation

Sign : one of + -

Integer : Sign? Digit+

Decimal : Sign? Digit+ Fractional

ScientificNotation : Sign? Digit+ Fractional? ExponentMarker Sign? Digit+

Fractional : . Digit+

ExponentMarker : one of `e` `E`

## String

A string stores an UTF-8 encoded list of characters.

The syntax of a string literal is a subset of JSON with the following extensions:

* Any control characters (including newlines) are allowed to appear inside a string.
* Extended support for refering to Unicode characters above 16-bit: `"\u{1F600}"`.

String :

* `"` DoubleStringCharacter* `"`
* `'` SingleStringCharacter* `'`

DoubleStringCharacter :

* SourceCharacter but not one of `"`, `\`
* `\` EscapeSequence

SingleStringCharacter :

* SourceCharacter but not one of `'`, `\`
* `\` EscapeSequence

EscapeSequence :

* SingleEscapeSequence
* UnicodeEscapeSequence

SingleEscapeSequence : one of ' `"` `\` `/` b f n r t

UnicodeEscapeSequence :

* u HexDigit HexDigit HexDigit HexDigit
* u{ HexDigit+ }

Escape sequences are interpreted as follows:

* `\'` represents U+0027.
* `\"` represents U+0022.
* `\\` represents U+005C.
* `\/` represents U+002F.
* `\b` represents U+0008.
* `\f` represents U+000C.
* `\n` represents U+000A.
* `\r` represents U+000D.
* `\t` represents U+0009.
* `\uXXXX` represents the Unicode code point U+XXXX.
* `\uXXXX\uYYYY`, where XXXX is a high surrogate (W1, 0xD800–0xDBFF) and YYYY is a low surrogate (W2, 0xDC00–0xDFFF) is interpreted as a UTF-16 surrogate pair and encoded into a single code point.

It's a syntactical error when a Unicode escape sequence represents an invalid Unicode code point.

## Array

An ordered collection of values, e.g. `[1, 2, 3]`. Can contain any combination of other types, including other arrays and mixed types. An element inside an array literal can be preceeded by `...` which causes it to be flattened into the array.

Array : [ ArrayElements? `,`? ]

ArrayElements :

* ArrayElement
* ArrayElements , ArrayElement

ArrayElement : `...`? Expression

EvaluateArray(scope):

1. Let {result} be a new empty array.
2. For each {ArrayElement}:
  1. Let {elementNode} be the {Expression} of the {ArrayElement}.
  2. Let {element} be the result of {Evaluate(elementNode, scope)}.
  3. If the {ArrayElement} contains {...}:
      1. If {element} is an array:
          1. Concatenate {element} to {result}.
  4. Otherwise:
      1. Append {element} to {result}.
3. Return {result}.

## Object

An unordered collection of key/value pairs (referred to as attributes) with unique keys, e.g. `{"a": 1, "b": 2}`. Keys must be strings, while values can be any combination of other types, including other objects. If duplicate keys are specified, the last key is used.

The values of an object literal can use the full power of expressions: 

```
*[_type == "rect"]{"area": width * height}
```

Note: A {Projection} expression is just an expression with an object literal to the right of it. 

Object literal supports syntactical sugar when the attribute name and value is equivalent:

```
// These two are equivalent
*[_type == "person"]{name}
*[_type == "person"]{"name": name}
```

Object : { ObjectAttributes? `,`? }

ObjectAttributes :

* ObjectAttribute
* ObjectAttributes , ObjectAttribute

ObjectAttribute :

* String : Expression
* Expression
* `...` Expression?

EvaluateObject(scope):

1. Let {result} be a new empty object.
2. For each {ObjectAttribute}:
  1. If the {ObjectAttribute} contains `...`:
      1. If the {ObjectAttribute} constains an {Expression}:
          1. Let {baseNode} be the {Expression}.
      2. Let {base} be the result of {Evaluate(baseNode, scope)}.
    2. Otherwise:
          1. Let {base} be the this value of {scope}.
    3. For each {name} and {value} of {base}:
          1. Set the attribute {name} to {value} in {result}.
  2. Otherwise:
      1. Let {valueNode} be the {Expression} of the {ObjectAttribute}.
    2. Let {value} be the result of {Evaluate(valueNode, scope)}.
    3. If the {ObjectAttribute} contains a {String}:
          1. Let {name} be the string value of the {String}.
    4. Otherwise:
          1. Let {name} be the result of {DetermineName(valueNode)}.
    5. Set the attribute {name} to {value} in {result}.
3. Return {result}.

DetermineName(node):

* If {node} is an {ThisAttribute}:
  * Return the string value of the {Identifier} of {node}.
* If {node} is a {Projection}, {ElementAccess}, {Slice}, or {Filter}:
  * Let {base} be the first {Expression} of {expr}.
  * Return the result of {DetermineName(base)}.

ValidateObject():

* For each {ObjectAttribute}:
  * If the {ObjectAttribute} does not contain a {String}:
      * Let {expr} be the {Expression}.
    * Execute {ValidateObjectAttribute(expr)}.

ValidateObjectAttribute(expr):

* If {node} is an {ThisAttribute}:
  * Stop.
* If {node} is a {Projection}, {ElementAccess}, {Slice}, or {Filter}:
  * Let {base} be the first {Expression} of {expr}.
  * Execute {ValidateObjectAttribute(base)}.
* Otherwise:
  * Report an error.

## Pair

A pair of values, e.g. `"a" => 1`. Pairs can contain any combination of other types, including other pairs, and are mainly used internally with e.g. projection conditionals and`select()`. In serialized JSON, pairs are represented as arrays with two values.

Pair : Expression `=>` Expression

EvaluatePair(scope):

* Let {firstNode} be the first {Expression}.
* Let {secondNode} be the second {Expression}.
* Let {result} be a new pair.
* Set the first value of {result} to the result of {Evaluate(firstNode, scope)}.
* Set the second value of {result} to the result of {Evaluate(secondNode, scope)}.
* Return {result}.

## Range

An interval containing all values that are ordered between the start and end values. The starting value is always included, while the end may be either included or excluded. A right-inclusive range is expressed as two values separated by `..`, e.g. `1..3`, while a right-exclusive range is separated by `...`, e.g. `1...3`.

Ranges can have endpoints of any comparable data type, but both endpoints must be of the same type (except integers and floats which can be used interchangeably). Ranges with incompatible or invalid endpoints types will yield `null`.

Ranges are mainly used internally, e.g. with the `in` operator and array slice access operator. The endpoints may have context-dependant semantics, e.g. in array slices the range `[2..-1]` will cover the range from the third array element to the last element, while the same range is considered empty when used with `in`. For more details, see the documentation for the relevant operators.

Range :

* InclusiveRange
* ExclusiveRange

InclusiveRange : Expression `..` Expression

ExclusiveRange : Expression `...` Expression

EvaluateRange(scope):

* Let {startNode} be the first {Expression}.
* Let {endNode} be the second {Expression}.
* Let {start} be the result of {Evaluate(startNode, scope)}.
* Let {end} be the result of {Evalaute(endNode, scope)}.
* If {PartialCompare(start, end)} is {null}:
  * Return {null}.
* Let {result} be a new range.
* Set the start value of {result} to {start}.
* Set the end value of {result} to {end}.
* Mark the range as inclusive or exclusive.
* Return {result}.

