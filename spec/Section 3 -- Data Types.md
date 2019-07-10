Data Types
-------

# Data Types

GROQ is strongly typed, meaning there is no implicit type conversion. Type conflicts (e.g. `1 + "a"`) will yield `null`.

## Basic Data Types

### Boolean

Logical truth values, i.e. {true} and {false}.

### Float

Signed 64-bit double-precision floating point numbers, e.g. `3.14`, using the [IEEE 754 binary64 format](https://en.wikipedia.org/wiki/Double-precision_floating-point_format#IEEE_754_double-precision_binary_floating-point_format:_binary64). These have a magnitude of roughly 10⁻³⁰⁷ to 10³⁰⁸, and can represent 15 significant figures with exact precision - beyond this, significant figures are rounded to 53-bit precision. The special IEEE 754 values of infinity and {NaN} (not a number) are not supported, and are coerced to {null}.

### Null

An unknown value, expressed as {null}. This is the SQL definition of null, which differs from the typical definition of "no value" in programming languages, and implies among other things that `1 + null` yields {null} (1 plus an unknown number yields an unknown number).

### String

A UTF-8 encoded string of characters. The maximum string length is undefined.

## Composite Data Types

### Array

An ordered collection of values, e.g. `[1, 2, 3]`. Can contain any combination of other types, including other arrays.

### Object

An unordered collection of key/value pairs (referred to as attributes) with unique keys, e.g. `{"a": 1, "b": 2}`. Keys must be strings, while values can be any combination of other types, including other objects. If duplicate keys are specified, the last key is used.

### Pair

A pair of values, e.g. `"a" => 1`. Pairs can contain any combination of other types, including other pairs, and are mainly used internally with e.g. projection conditionals and`select()`. In returned JSON, pairs are represented as arrays with two values.

### Range

An interval containing all values that are ordered between the start and end values. The starting value is always included, while the end may be either included or excluded. A right-inclusive range is expressed as two values separated by `..`, e.g. `1..3`, while a right-exclusive range is separated by `...`, e.g. `1...3`.

Ranges can have endpoints of any basic data type, but both endpoints must be of the same type (except integers and floats which can be used interchangeably). Ranges with incompatible or invalid endpoints types will yield `null`.

Ranges are mainly used internally, e.g. with the `in` operator and array slice access operator. The endpoints may have context-dependant semantics, e.g. in array slices the range `[2..-1]` will cover the range from the third array element to the last element, while the same range is considered empty when used with `in`. For more details, see the documentation for the relevant operators.

## Subtypes

Subtypes are subsets of basic or composite types. Operators and functions that can act on the supertype can always act on the subtype as well, but the behavior may be modified, and some operators and functions can only act on the subtype.

### Datetime

Datetimes are strings with ISO 8601-formatted date/time combinations.

### Reference

References are objects that represent a reference to a different document. They have the following special attributes (in addition to other arbitrary attributes):

* `_ref` (path, required): The ID of the referenced document.

