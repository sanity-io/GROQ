# Syntax

A GROQ query is a string consisting of Unicode characters. The encoding of the query string is implementation-defined, but UTF-8 is the preferred choice. A query consist of a single {Expression}, with {WhiteSpace} and {Comment} allowed anywhere with no effect on the interpretation.

SourceCharacter : "any Unicode character"

## JSON Superset

GROQ's syntax is a superset of JSON, so any valid JSON value is a valid GROQ expression (that simply returns the given value). Below are a few examples of JSON values:

```
"Hi! 👋"
```

```javascript
;['An', 'array', 'of', 'strings']
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

## White Space

Whitespace is not significant in GROQ, except for acting as a token separator and comment terminator. Any sequence of the following characters is considered whitespace.

WhiteSpace :

- "Tab U+0009"
- "Newline U+000A"
- "Vertical tab U+000B"
- "Form feed U+000C"
- "Carriage return U+000D"
- "Space U+0020"
- "Next line U+0085"
- "Non-breaking space U+00A0"

Whitespace inside a string literal is interpreted as-is.

## Comments

Comment : // CommentChar\*

CommentChar : SourceCharacter but not "Newline U+000A"

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

## Identifier

Identifiers are used to name entities such as parameters, attributes and functions. An identifier is a sequence of one or more letters and digits. The first character in an identifier must be a letter.

Identifier : /[A-Za-z\_][a-za-z_0-9]\*/

## Selector

To select a subset of fields in a document GROQ implements selectors. A selector can either be an [Identifier](#sec-Identifier) or a tuple of Identifiers.

Selector :

- `title`
- `doc.title`
- `(title, subtitle)`
- `doc.(title, subtitle)`

Note: Selectors aren't a distinct type of expression, but are meant to be used with the diff-extension.

## Digits

GROQ uses decimal digits (0-9) and hexadecimal digits (0-9, a-f) in various places.

Digit : one of 0 1 2 3 4 5 6 7 8 9

HexDigit :

- Digit
- HexDigit

HexLetter : one of a `A` b `B` c `C` d `D` e `E` f `F`

## Expression

An {Expression} is either a literal (e.g. `15`), a simple expression (e.g. `@`), or a compound expression (e.g. `*[name == "Michael"]`) or an operator call (e.g. `name == "Michael"`). The syntax and semantics of the different expressions are documented in their respective sections.

Expression :

- Literal
- SimpleExpression
- CompoundExpression
- OperatorCall

Literal :

- Null
- Boolean
- Number
- String
- Array
- Object

SimpleExpression :

- This
- ThisAttribute
- Everything
- Parent
- FuncCall

CompoundExpression :

- Parenthesis
- TraversalExpression
- PipeFuncCall

OperatorCall :

- And
- Or
- Not
- Equality
- Comparison
- In
- Match
- Asc
- Desc
- UnaryPlus
- UnaryMinus
- Plus
- Minus
- Star
- Slash
- Percent
- StarStar
