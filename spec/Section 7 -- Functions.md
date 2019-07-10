Functions
-------

# Functions

Functions take a set of arguments of specific types and return a single value of a specific type. They may be polymorphic, i.e. accept several argument type variations possibly returning different types, and may take a variable number of arguments. Function calls return `null` if arguments have invalid types, and an error if the function does not exist. GROQ has some standard functions described in this section, but can be extended with vendor-specific functio

Note: Functions may throw errors rather than return `null` on type conflicts.

## coalesce

```groq
coalesce(<any>...) <any>
```

Takes a variable number of arguments of any type, and returns the first non-`null`argument if any, otherwise `null` - e.g. `coalesce(null, 1, "a")` returns `1`.

## count

```groq
count(<array>) <integer>
```

Returns the number of elements in the passed array, e.g. `count([1,2,3])` returns `3`.

## defined

```groq
defined(<any>) boolean
```

Returns `true` if the argument is non-`null` and not an empty array or object, otherwise `false`.

## length

```groq
length(<array|string>) <integer>
```

Returns the length of the argument, either the number of elements in an array or the number of Unicode characters in a string, e.g. `length([1,2,3])` returns `3` and `length("Hi! 👋")` returns `5`.

## now

```groq
now() datetime
```

Returns the current time in ISO 8601-format with microsecond resolution in the UTC time zone, e.g. `2019-03-06T15:51:24.846513Z`. The current time is stable within an operation such that multiple calls return identical values, and this generally refers to the start time of the operation.

## references

```groq
references(<path|string>) <boolean>
```

Implicitly takes the document at the root of the current scope and recursively checks whether it contains any references to the given document ID. It is typically used in query filters, e.g. `*[ references("abc") ]` will return any documents that contains a reference to the document `abc`.

## round

```groq
round(<integer|float>[, <integer>]) <integer|float>
```

Rounds the given number to the nearest integer, or to the number of decimal places given by the second, optional argument - e.g. `round(3.14)` yields `3` and `round(3.14, 1)` yields `3.1`.

## select

```groq
select(<pair|any>...) <any>
```

Used for conditionals, i.e. "if-else" expressions. Takes a variable number of arguments that are either pairs or any other type and iterates over them. When encountering a pair whose left-hand value evaluates to `true`, the right-hand value is returned immediately. When encountering a non-pair argument, that argument is returned immediately. Falls back to returning `null`.

For example, the following call returns `"adult"` if `age >= 18`, otherwise `"teen"` if `age >= 13`, otherwise `"child"`:

```groq
select( age >= 18 => "adult", age >= 13 => "teen", "child", )
```

