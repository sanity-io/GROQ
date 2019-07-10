Syntax
-------

# Language

## Syntax

A query in GROQ has typical this form:

```
*[<filter>]{<projection>}
```

`*` returns all documents in the dataset that the current user has permissions to read. The documents are passed to a filter, which retains documents for which the expression evaluates to {true}. The remaining documents are passed to a projection, which determines how the result should be formatted.

A GROQ query of this form operates as a query pipeline, where the results from each expression is passed as inputs to the next. The filter and projection are both optional, and a query can have any number of them, in any order, as well as other pipeline expressions. There are implicit `|` (pipe) operators between these components, so the query above could equivalently be written as:

```
* | [<filter>] | {<projection>}
```

In pipeline expressions, document attributes can be accessed by name. For example, this query would fetch directors born since 1970, and return their name, year of birth, and a list of their movies:

```
*[_type == "director" && birthYear >= 1970]{ 
  name,
  birthYear,
  "movies": *[ _type == "movie" && director._ref == ^._id]
}
```

## Source Text

SourceCharacter :: /[\u0009\u000A\u000D\u0020-\uFFFF]/

### Unicode

UnicodeBOM :: "Byte Order Mark (U+FEFF)"

Non-ASCII Unicode characters may freely appear within {StringValue} and {Comment} portions of GROQ.

The "Byte Order Mark" is a special Unicode character which may appear at the beginning of a file containing Unicode which programs may use to determine the fact that the text stream is Unicode, what endianness the text stream is in, and which of several Unicode encodings to interpret.

### White Space

Whitespace is not significant in GROQ, except for acting as a token separator and comment terminator. Any sequence of the following characters is considered whitespace, with Unicode code points in parenthesis.

WhiteSpace ::

* "Tab U+0009"
* "Newline U+000A"
* "Vertical tab U+000B"
* "Form feed U+000C"
* "Carriage return U+000D"
* "Space U+0020"
* "Next line U+0085"
* "Non-breaking space U+00A0"

Whitespace inside a string literal is interpreted as-is.

### Comments

Comment :: // CommentChar*

Comments serve as query documentation, and are ignored by the parser. They start with `//` and run to the end of the line:

```
{ 
  // Comments can be on a separate line 
  "key": "value" // Or at the end of a line 
}
```

Comments cannot start inside a string literal.

```
{ 
  "key // This isn't a comment": "value"
}
```

### JSON Superset

GROQ's syntax is a superset of JSON, so any valid JSON value is a valid GROQ query (that simply returns the given value). Below are a few examples of JSON values:

```
"Hi! 👋"
```

```javascript
["An", "array", "of", "strings"]
```

```json
{
  "array": ["string", 3.14, true, null],
  "boolean": true,
  "number": 3.14,
  "null": null,
  "object": {"key": "value"},
  "string": "Hi! 👋"
}
```

## Expressions

An expression is one of the following:

* A literal, attribute lookup, parameter, or constant.
* An operator invocation (and by extension a pipeline).
* A function call.

Expressions can be used anywhere that a value is expected, such as in object values, array elements, operator operands, or function arguments. The expression is in effect replaced by the value which it evaluates to.

Note: Due to parser ambiguity with filters, the following access operators can only take literals, not arbitrary expressions: array element access (e.g. `array[0]`), array slices (e.g. `array[1..3]`), and object attribute access (e.g. `object["attribute"]`) .

## Literals

Literals are inline representations of constant values, e.g. `"string"` or `3.14`. GROQ supports all JSON literals, with a few enhancements and additional data types.

### Boolean and Null Literals

The constants `true`, `false`, and `null`.

### Float Literals

Floats have an integer part, a fractional part, and an exponent part. The integer part is required, and at least one of the fractional or exponent parts must be given.

The integer part is equivalent to an integer literal. The fractional part is a decimal point `.` followed by a sequence of digits. The exponent part is `e` or `E` followed by an optional `+` or `-` sign followed by an integer specifying base-10 exponentiation.

The following are examples of float literals:

```
3.0
3.143e6 // Equivalent to 3000000.0
3.14eE0 // Equivalent to 3.14
3.14e-2 // Equivalent to 0.0314
```

### String Literals

A sequence of zero or more UTF-8 encoded characters surrounded by single or double quotes, e.g. `"Hello world! 👋"`. The following escape sequences are supported (mirroring JSON), all of which are valid in both single- and double-quoted string literals:

* `\\`: backslash
* `\/`: slash
* `\'`: single quote
* `\"`: double quote
* `\b`: backspace
* `\f`: form feed
* `\n`: newline
* `\r`: carriage return
* `\t`: tab
* `\uXXXX`: UTF-16 code point, where `XXXX` is the hexadecimal character code
* `\uXXXX\uXXXX`: UTF-16 surrogate pair

### Array Literals

A comma-separated list of values enclosed by `[]`, e.g. `[1, 2, 3]`. The final element may be followed by an optional trailing comma.

### Object Literals

A comma-separated list of key-value pairs enclosed by `{}`, where the key and value of each pair is separated by `:`, e.g. `{"a": 1, "b": 2}`. Keys must be strings. The final pair may be followed by an optional trailing comma.

### Pair Literals

Two values separated by `=>`, e.g. `"a" => 1`.

### Range Literals

Two values separated by `..` (right-inclusive) or `...` (right-exclusive), e.g. `1..3`.

## Identifiers

Identifiers name query entities such as attributes, parameters, functions, and some operators. Identifiers must begin with `a-zA-Z_`, followed by any number of characters matching `a-zA-Z0-9_`. Parameters are prefixed with `$`.

### Reserved Keywords

The following keywords are reserved and cannot be used as identifiers:

* `false`
* `null`
* `true`

## Attribute Lookup

A bare identifier looks up the value of the corresponding attribute in the document or object at the root of the current scope. For example, in the following query `category`returns the value of the `category` attribute of the document currently being considered by the filter:

```
*[category == "news"]
```

If the attribute does not exist, or if the root value of the scope is not a document or object, then the identifier will return `null`.

Note: JSON allows attribute keys to be any arbitrary UTF-8 string. In cases where the key is not a valid GROQ identifier, it can instead be accessed by using the `@` operator (typically returning the current document) and the `[]` attribute access operator, e.g. `@["1 illegal name 🚫"]`.

### Attribute Scope

Attribute lookups are scoped, such that the same identifier may refer to different attributes in different contexts. New scopes are created by pipeline expressions, typically by iterating over the piped array elements and evaluating an expression in the scope of each element.

The `@` operator can be used to access the root value of the scope (also known as "this"), like in the following example where it refers to each number contained in the `numbers` array:

```
numbers[ @ >= 10 ]
```

Scopes can also be nested, in which case the `^` operator can be used to access the root value of the parent scope. Consider the following query:

```
*[ _type == "movie" && releaseYear >= 2000 ]{
  title,
  releaseYear,
  crew{name, title},
  "related": *[ _type == "movie" && genre == ^.genre ]
}
```

In the filter, `_type` and `releaseYear` access the corresponding attributes of each doument passed from `*`. Similarly, in the projection, `title`, `releaseYear`, and `crew`access the corresponding attributes from each document passed from the filter. However, in the nested `crew` projection, `name` and `title` access the attributes of each object passed from the `crew` array - notice how the outer and inner `title`identifiers refer to different attributes (one is from the movie, the other is from the crew member).

The `related` pipeline components also create new scopes where `_type` and `genre`refer to the attributes of each document fetched from the preceding `*` operator, not those of the surrounding projected document. Notice how the `^` operator is used to access the document at the root of the parent (outer) scope and fetch its `genre`attribute.

## Operators

GROQ supports nullary, unary, and binary operators which return a single value when invoked. Unary operators can be either prefix or postfix (e.g. `!true` or `ref->`), while binary operators are always infix (e.g. `1 + 2`). Operators are made up of the characters `=<>!|&+-*/%@^`, but identifiers can also be used to name certain binary operators (e.g. `match`), in which case they are considered reserved keywords.

## Functions

GROQ function calls are expressed as a function identifier immediately followed by a comma-separated argument list in parentheses, e.g. `function(arg1, arg2)`. The final argument may be followed by an optional trailing comma. Functions can take any number of arguments (including zero), and return a single value.

## Pipeline Expressions

Pipelines are constructed by the binary `|` operator, which takes a left-hand value and passes it to a right-hand pipeline component which processes it and returns a new value. For example, the following pipeline fetches all documents, pipes them to a filter which returns an array of documents that satisfy the filter, then pipes them to an order component which sorts them:

```
* | [ _type == "person" && age >= 18 ] | order(name)
```

Pipeline expressions typically take a piped array and iterate over each element, evaluating an expression in the scope of the element which determines its output. The `|` operator is implicit (optional) in front of certain components, and they may also have a range of syntactic sugar to make them more pleasant to work with (projections in particular).

