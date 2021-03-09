Execution
-------

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

## Score evaluation

When evaluating {score}, a predicate returning `true` should evaluate to the score `1.0`, and a `false` predicate should evaluate to the score `0.0`. For example, the expression:

```
* | score(a > 1)
```

should assign a score of 2.0 to any document where `a > 1`, and a score of 1.0 to any non-matching document.

The scoring function for `match` is left as an implementation detail and not covered by this specification. For example, an implementation may choose to use a TD/IDF scoring function that uses the text corpus and language configuration for the given field to compute a text score.

A boosted predicate simply adds the boost value to the score. For example, `boost(a > 1, 10)` would return `11` for any expression matching `a > 1`.

## Query execution

To execute a query you must first construct a query context, and then evaluate the query expression inside a root scope.

ExecuteQuery(query, context):

* Let {scope} be the result of {NewRootScope(context)}.
* Let {expr} be the expression of {query}.
* Let {result} be the result of {Evalute(expr, scope)}.
* Return {result}.
