Pipeline Expressions
-------

# Pipeline Expressions

A pipeline connects a set of expressions via the `|` (pipe) operator, by passing the array given by the left-hand operand to the pipeline expressions given by the right-hand operand and yields its return value. Some expressions have an implicit pipe operator, and thus do not need to be explicitly prefixed by `|`.

For example, the following query pipeline fetches all documents from the data store, passes them to a filter, then a projection, and finally orders the results:

```
* | [ _type == "movie" && releaseYear >= 1980] | {
  title,
  releaseYear,
  genre
} | order(releaseYear desc, title asc) |
```

A pipeline expression typically iterates over the array elements and evaluates an expression in the scope of each iterated value (as described in "Attribute Scope" in the Syntax section

## Filter Expression

Iterates over the elements of the piped array, evaluates the given boolean expression in the scope of each element, and returns an array of elements for which the expression evaluated to `true`. The preceding `|` operator is optional for filters.

For example, the following filter will retain documents of type `movie`where the `releaseYear` attribute is greater than or equal to 1980:

```
*[ _type == "movie" && releaseYear >= 1980]

```

## Slice Expression

Returns an array containing the elements of the piped array whose zero-based indices fall within the range, e.g. `* | [2..4]` yields elements 3, 4, and 5 from the piped array. The preceding `|` operator is optional for slices. The range may extend beyond the array bounds.

Negative range endpoints are based at the end of the piped array, so e.g. `array[2..-1]` yields all elements from the third to the last. If the right endpoint falls before the left endpoint the result is an empty array.

## Subscript Expression

Returns the element at the given zero-based index of the piped array, e.g. `* | [2]` returns the third element of the piped array, or `null` if not found. Negative indices are based at the end of the array, e.g. `array[-2]` yields the second-to-last element. The preceding `|`operator is optional for slices.

## Projection Expression

Projections iterate over the elements of the piped array, generate an object of the given form evaluated in the scope of each element, and append it to the output array. The preceding `|` operator is optional for projections.

For example, the projection `* | {"key": value}` iterates over all documents, and for each document generates an object with a single key `key` whose value is set to the value of the `value` attribute of the document, if any.

Attribute values in projections can be arbitrary GROQ expressions, e.g. `* | {"name": firstName + " " + lastName}`. Any attribute whose value evaluates to `null` is not included in the projection.

If bare attributes are given in a projection, this inserts the corresponding attribute from the input element in the output object - e.g. the projection `{_id, name}` is exactly equivalent to `{"_id": _id, "name": name}`. Bare attributes can also be used with access operators, where the left-most attribute name is used as the key, e.g. `{ref->attribute.array[0]}` will result in an object with a `ref` key containing the specified array element.  
Other objects can be expanded into the projection with the `...`operator. For example, `{name, ...properties}` will take all attributes from the `properties` object and place them in the root of the projected object along with the root `name` attribute.

A bare `...` is syntactic sugar for `...@`, i.e. it inserts all attributes from the currently iterated element into the projection. For example, `{..., "key": "value}` generates an object with all of the object's original attributes in addition to the generated `key` attribute.

If multiple keys with the same name are given, then the latest key wins. The only exception is with the bare `...` syntactic sugar mentioned above, which is always evaluated first regardless of its position in the projection. For example, the projection `{"name": "someName", ...}` will replace the original `name` attribute of the object, if any.

Since projection values are arbitrary GROQ expressions, nested projections are supported (and encouraged), e.g.:

```
*[ _type == "book" ]{
  title,
  "authors": authors{
    "name": firstName + " " + lastName,
    birthYear,
  }
}
```

In this case, the nested `authors` projection takes its input from the `authors` array, and generates an output array of projected objects as usual. This projection is evaluated in a new scope (as described in "Attribute Scope" in the Syntax section`^` operator.

Projections also have syntactic sugar for conditionals, expressed as `condition => {}`. If `condition` evaluates to `true`, the object on the right-hand side of `=>` is expanded into the projection. For example, the following projection will include the `movies` attribute containing a list of related movies if the person is a director, otherwise the attribute will be omitted:

```
{
  name,
  role == "director" => {
    "movies": *[ _type == "movie" && director._ref == ^._id ]
  }
}
```

This syntax is exactly equivalent to `...select(condition => {})`. Each conditional in a projection is evaluated separately - for cases where multiple conditions overlap and only a single result (the first) should be included then the full `select()` syntax must be used instead.

## Map Expression

Mapping evaluates an arbitrary expression in the scope of each piped element, and appends the result to the output array - e.g. `* | (firstName + " " + lastName)` returns an array of names. This can also be used e.g. for array projections, such as `* | ([ firstName, lastName, age ])` returning an array of 3-element arrays that each contains the person's first name, last name, and age.

## Order Expression

`order()` sorts the piped array according to the given expression and returns an array of sorted elements, e.g. `* | order(name asc, age desc)`. The direction can be either `asc` or `desc`, defaulting to `asc`if not given. Any number of sort expressions can be given, which specify sorting last-to-first.

