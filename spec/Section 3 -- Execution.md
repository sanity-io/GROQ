# Execution

## Overview

Note: The following sub-section is a non-normative overview of the execution model. See the rest of the section for the exact semantics.

A GROQ query is executed inside a query context, which contains the dataset and parameters, and returns a result. Typically the result is serialized to JSON. During the execution of a query different parts of the query are evaluated in different scopes. Each scope has a *this *value and can be nested. Simple attributes like `name` always refers to an attribute on the *this *value.

```groq
*[_type == "person"]{name, friends[country == "NO"]}
```

In the preceding example we have several scopes:

* The first filter (`[_type == "person"]`) creates a new scope for every document in the dataset. An equivalent scope is created inside the projection (`{name, …}`).
* The country filter (`[country == "NO"]`) creates a new scope for each element in the `friends` array.

The parent expression (`^`) let's you refer to parent scopes, and this enables what is typically solved with joins in many databases.

```groq
*[_type == "person"]{
  id,
  name,
  "children": *[_type == "person" && parentId == ^.id]
}
```

While executing the inner filter (`[_type == "person" && parentId == ^.id]`) the expression `^.id` returns the `id` attribute of the parent scope's *this* value. The parent scope is here the scope created by the projection (`{id, name, …}`).

It's possible for a query to be *invalid*. This can happen when you e.g. use an unknown function or call a function with incorrect number of arguments.

## Query context

A query context consists of:

* the dataset
* parameter values (map from {string} to {value})

## Scope

A scope consists of:

* a this value
* an optional parent scope
* a query context

A root scope can be constructed from a query context, and a nested scope can be constructed from an existing scope.

NewNestedScope(value, scope):

* Let {newScope} be a new scope.
* Set the this value of {newScope} to {value}.
* Set the parent scope of {newScope} to {scope}.
* Set the query context of {newScope} to the query context of {scope}.
* Return {newScope}.

NewRootScope(context):

* Let {newScope} be a new scope.
* Set the this value of {newScope} to {null}.
* Set the parent scope of {newScope} to {null}.
* Set the query context of {newScope} to {context}.
* Return {newScope}.

## Expression validation

An expression can be validated. This will only check that it's on a valid form, and will not execute anything. If an expression type does not have an explicitly defined validator in this specifiction, it has an implicit validator which runs {Validate} on all its child expressions.

Validate(expr):

* Let {validator} be the validator of {expr}.
* Execute the {validator}.

## Expression evaluation

An expression is evaluated in a scope. You must successfully validate an expression before you attempt to evaluate it. Every expression type has their own evaluator function in their respective section in this specification (e.g. the evaluator of {ParenthesisExpression} is {EvaluateParenthesis()}).

Evaluate(expr, scope):

* Let {evaluator} be the evaluator of {expr}.
* Return the result of {evaluator(scope)}.

## Constant expression evaluation

Some expressions can be evaluated into a constant value. This is used for validation and to disambiguate between different syntactically ambiguous expressions.

ConstantEvaluate(expr):

* If {expr} is one of: {Literal}, {Parenthesis}, {Plus}, {Minus}, {Star}, {Slash}, {Percent}, {StarStar}, {UnaryPlus}, {UnaryMinus}.
  * Let {evaluator} be the evaluator of {expr}.
  * Let {result} be the result of executing {evaluator}, but using {ConstantEvaluate()} in-place of every {Evaluate()}.
  * Return the {result}.
* Otherwise: Report an error.

## Score evaluation

When evaluating {score}, a predicate returning `true` should have its score computed as 1.0, and all other values should receive a score of 0.0. All results involved in scoring start with a score of 1.0. The scores are evaluated once per result, and then added together. For example:

```groq
* | score(a > 1)
```

should assign a score of 2.0 to any document where `a > 1`, and a score of 1.0 to any non-matching document.

For logical expressions, the score is the sum of the clauses of the expression evaluates to `true`, otherwise 0.0. In other words:

* `true && false` receives the score 0.0.
* `true && true` receives the score 2.0.
* `true || true` receives the score 2.0.
* `true || false` receives the score 1.0.

The scoring function for `match` is left as an implementation detail and not covered by this specification. For example, an implementation may choose to use a TF/IDF or similar text scoring function that uses the text corpus and language configuration for the given field to compute a text score.

A boosted predicate simply adds the boost value to the score if the predicate matches. For example, `boost(a > 1, 10)` would result in a score of 11 for any expression matching `a > 1`.

## Traversal execution

When working with JSON values you often need to access attributes in deeply nested arrays/objects.
In JavaScript this is solved by using helper functions such as `map`, `filter` and `flatMap`.
GROQ provides terse syntax for accomplishing the same functionality.

```example
// The following GROQ:
*[_type == "user"]._id

// is equivalent to the following JavaScript:
data.filter(u => u._type == "user").map(u => u._id)
```

The following expressions are implemented as a *traversal*:

* `foo.bar`: {AttributeAccess}.
* `foo->`: {Dereference}.
* `foo[0]`: {ElementAccess}.
* `foo[0...5]`: {Slice}.
* `foo[type == "admin"]`: {Filter}.
* `foo[]`: {ArrayPostfix}.
* `foo{name}`: {Projection}.

When these traversals are combined (e.g. `foo.bar[0].baz[val > 2]{a, b}`) it triggers a separate traversal logic.

Informally the traversal logic is based on a few principles:

* Traversal semantics are always statically known.
  The runtime value of an expression never impacts the overall interpretation of a traversal.
* We categorize traversals into four types (plain, array, array source, array target) based on how they work on arrays.
  `.foo.bar` is considered a *plain* traversal because it statically only deals with plain values.
  `[_type == "user"]` is considered an *array* traversal because it works on arrays.
* Placing a plain traversal next to an array traversals (`[_type == "user"].foo.bar`) will execute the plain traversal *for each element* of the array.

Formally the semantics are specified as follows:

* Each traversal has a *traverse function* which describes how it will traverse a value.
  This function takes a value and a scope as parameters.
* There's a set of traversal combination functions which specifies how two traversals can be combined.
  This explains exactly how `.foo.bar` is mapped over each element of an array.
* {TraversalPlain}, {TraversalArray}, {TraversalArraySource}, {TraversalArrayTarget} specifies the exact rules for how multiple traversals are combined together.
* The {TraversalExpression} node is an {Expression} for the full set of traversal operators.
  This kicks off the whole traversal semantics.

### Combining traversal

Multiple traversals are combined in four different ways:

* *Joined*:
  In `.user.name` we want to execute the first traversal (`.user`), and then apply the second traversal (`.name`) on the result.
  This is specified by the {EvaluateTraversalJoin()} function.
* *Mapped*: 
  In `[_type == "user"].id` we want to execute the first traversal (`[_type == "user"]`), and then apply the second traversal (`.id`) for each element of the array.
  This is specified by the {EvaluateTraversalMap()} function.
* *Flat-mapped*: 
  In `[_type == "user"].names[]` we want to execute the first traversal (`[_type == "user"]`), and then apply the second traversal (`.names[]`) for each element of the array, and then flatten the result.
  This is specified by the {EvaluateTraversalFlatMap()} function.
* *Inner mapped*: 
  In `{name,type}[type == "admin"]` we want to execute the first traversal (`{name,type}`) for each element of the array, and then apply the second traversal (`[type == "admin"]`) on the full array.
  This is specified by the {EvaluateTraversalInnerMap()} function.

Unless otherwise specified, any two traversal are combined using the {EvaluateTraversalJoin()} function.

EvaluateTraversalJoin(base, scope):
* Let {traverse} be the traverse function of the first node.
* Let {nextTraverse} be the traverse function of the last node.
* Let {result} to be the result of {traverse(base, scope)}.
* Set {result} to be the result of {nextTraverse(result, scope)}.
* Return {result}.

EvaluateTraversalMap(base, scope):

* Let {traverse} be the traverse function of the first node.
* Let {nextTraverse} be the traverse function of the last node.
* Set {base} to be the result of {traverse(base, scope)}.
* If {base} is not an array:
  * Return {null}.
* Let {result} be an empty array.
* For each {value} in {base}:
  * Let {elem} be the result of {nextTraverse(value, scope)}.
  * Append {elem} to {result}.
* Return {result}.

EvaluateTraversalFlatMap(base, scope):

* Let {traverse} be the traverse function of the first node.
* Let {nextTraverse} be the traverse function of the last node.
* Set {base} to be the result of {traverse(base, scope)}.
* If {base} is not an array:
  * Return {null}.
* Let {result} be an empty array.
* For each {value} in {base}:
  * Let {elem} be the result of {nextTraverse(value, scope)}.
  * If {elem} is an array:
    * Concatenate {elem} to {result}.
* Return {result}.

EvaluateTraversalInnerMap(base, scope):

* Let {traverse} be the traverse function of the first node.
* Let {nextTraverse} be the traverse function of the last node.
* If {base} is not an array:
  * Return {null}.
* Let {result} be an empty array.
* For each {value} in {base}:
  * Let {elem} be the result of {traverse(value, scope)}.
  * Append {elem} to {result}.
* Set {result} to be the result of {nextResult(base, scope)}.
* Return {result}.


### Plain traversal

A plain traversal is a traversal which works on and returns unknown types.

* `.foo.bar`
* `.foo[0].baz`
* `.baz->{name}`

The following are _not_ considered plain traversals:

* `[_type == "foo"].bar` (because it works on an array)
* `.names[]` (because it returns an array)

BasicTraversalPlain :

* AttributeAccess
* Dereference

TraversalPlain : 

* BasicTraversalPlain
* BasicTraversalPlain TraversalPlain
* BasicTraversalPlain TraversalArraySource
* Projection
* Projection TraversalPlain

### Array traversals

An array traversal is a traversal which statically is known to works on and return an array:

* `[_type == "user"].id`
* `[_type == "user"].names[]`
* `{name,type}[type == "admin"]`

The following are _not_ considered array traversals:

* `[_type == "foo"].bar[0]` (because it returns an unknown type)
* `.names[]` (because it works on a non-array)

BasicTraversalArray :

* Slice
* Filter
* ArrayPostfix

TraversalArray :

* BasicTraversalArray
* BasicTraversalArray TraversalArray
* ElementAccess TraversalArray
* ElementAccess TraversalArrayTarget
* BasicTraversalArray TraversalPlain "(Evaluated using EvaluateTraversalMap)"
* BasicTraversalArray TraversalArrayTarget "(Evaluated using EvaluateTraversalFlatMap)"
* Projection TraversalArray "(Evaluated using EvaluateTraversalInnerMap)"

### Array source traversals

An array source traversal is a traversal which statically is known to work on an array, but returns an unknown type:

* `[0].foo.bar`
* `[_type == "foo"].id[0]`
* `{name,type}[0]`

The following are _not_ considered array source traversals:

* `[_type == "foo"].id` (because it returns an array)
* `.foo.bar` (because it doesn't work on an array)

TraversalArraySource :

* ElementAccess
* ElementAccess TraversalArraySource
* ElementAccess TraversalPlain
* BasicTraversalArray TraversalArraySource
* Projection TraversalArraySource "(Evaluated using EvaluateTraversalInnerMap)"

### Array target traversals

An array target traversal is a traversal which statically is known to return on an array, but works on an unknown type:

* `foo.bar[_type == "baz"]`
* `{name,type}[]`

The following are _not_ considered array source traversals:

* `[_type == "foo"].id` (because it also works on an array)
* `.foo.bar` (because it doesn't work on an array)

TraversalArrayTarget :

* BasicTraversalPlain TraversalArray
* BasicTraversalPlain TraversalArrayTarget
* Projection TraversalArrayTarget

## Query execution

To execute a query you must first construct a query context, and then evaluate the query expression inside a root scope.

ExecuteQuery(query, context):

* Let {scope} be the result of {NewRootScope(context)}.
* Let {expr} be the expression of {query}.
* Let {result} be the result of {Evalute(expr, scope)}.
* Return {result}.
