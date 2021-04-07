# Overview

GROQ (Graph-Relational Object Queries) is a declarative language designed to query collections of largely schema-less JSON documents. Its primary design goals are expressive filtering, joining of several documents into a single response, and shaping the response to fit the client application.

The idea behind GROQ is to be able to describe exactly what information your application needs, potentially joining together information from several sets of documents, then stitching together a very specific response with only the exact fields you need.

A query in GROQ typically starts with `*`. This asterisk represents every document in your dataset. It is typically followed by a {filter} in brackets. The {filter} take {terms}, {operators} and {functions}. A {projection}* *is wrapped in curly braces and describe the data as we want it returned. 

Given these JSON documents:

```json
{ "id": 1, "name": "Peter"}
{ "id": 2, "name": "Gamora"}
{ "id": 3, "name": "Drax"}
{ "id": 4, "name": "Groot"}
{ "id": 5, "name": "Rocket"}
```

The following query:

```groq
*[id > 2]{name}
```

Will result in the following JSON document:

```json
[
  { "name": "Drax"},
  { "name": "Groot"},
  { "name": "Rocket"}
]
```
