# Syntax

A GROQ query is a string consisting of Unicode characters. The encoding of the query string is implementation-defined, but UTF-8 is the preferred choice.

SourceCharacter : "any Unicode character"

A query consist of a single {Expression} optionally preceded by a list of {FuncDecl}, with {WhiteSpace} and {Comment} allowed anywhere with no effect on the interpretation.

Query : FuncDecl\* Expression

## JSON Superset

GROQ's syntax is a superset of JSON, so any valid JSON value is a valid GROQ expression (that simply returns the given value). Below are a few examples of JSON values:

```json
"Hi! 👋"
```

```json
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

```example
{
  // Comments can be on a separate line
  "key": "value" // Or at the end of a line
}
```

Comments cannot start inside a string literal.

```example
{
  "key // This isn't a comment": "value"
}
```

## Identifier

Identifiers are used to name entities such as parameters, attributes and functions. An identifier is a sequence of one or more letters and digits. The first character in an identifier must be a letter.

Identifier : `/[A-Za-z\_][A-Za-z_0-9]\*/`

## Digits

GROQ uses decimal digits (0-9) and hexadecimal digits (0-9, a-f) in various places.

Digit : one of 0 1 2 3 4 5 6 7 8 9

HexDigit :

- Digit
- HexLetter

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
- Parameter
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

## Selector

A selector is a subset of an expression used to search for fields inside a document.
They have their own evaluation logic (see {EvaluateSelector()}) which is used by certain functions.

Selector :

- ThisAttribute
- SelectorGroup
- SelectorTuple
- Selector AttributeAccess
- Selector ArrayPostfix
- Selector Filter
- Selector `.` SelectorGroup
- Selector `.` SelectorTuple

SelectorGroup:

- `(` Selector `)`

SelectorTuple:

- `(` Selector SelectorTuplePart+ `)`

SelectorTuplePart :

- `,` Selector
