Joins
-------

# Joins

Joins are supported via the reference access operator `->`, via subqueries that use the parent scope operator `^`, and via the `references()` function. The reference data type can be used in documents to explicitly reference other documents and enforce referential integrity, but joins can be made using arbitrary join conditions not involving reference fields at all.

Consider the following documents representing an employee and a department:

```json
{
  "_id": "alice",
  "_type": "employee",
  "name": "Alice Anderson",
  "department": {"_ref": "engineering"}
}
{
  "_id": "engineering",
  "_type": "department",
  "name": "Engineering"
}
```

The employee can be joined with the department by applying the `->`reference access operator to the `department` field, which fetches the referenced `engineering` document and inserts it into the projected document under the `department` attribute:

```
*[ _type == "employee" ]{ ..., department-> }

{
  "_id": "alice",
  "_type": "employee",
  "name": "Alice Anderson",
  "department": {
    "_id": "engineering",
    "_type": "department",
    "name": "Engineering"
  }
}

```

The department can also be joined with its employees by using a subquery that refers to the department's ID via the `^` parent scope operator:

```
*[ _type == "department" ]{
  ...,
  "employees": *[ _type == "employee" && department._ref == ^._id ]
}

{
  "_id": "engineering",
  "_type": "department",
  "name": "Engineering",
  "employees": [
    {
      "_id": "alice",
      "_type": "employee",
      "name": "Alice Anderson",
      "department": {"_ref": "engineering"}
    }
  ]
}
```

Or the `references()` function can be used to fetch any employees that contain a reference to the department anywhere in their content:

```
*[ _type == "department" ]{
  ...,
  "employees": *[ _type == "employee" && references(^._id) ]
}

{
  "_id": "engineering",
  "_type": "department",
  "name": "Engineering",
  "employees": [
    {
      "_id": "alice",
      "_type": "employee",
      "name": "Alice Anderson",
      "department": {"_ref": "engineering"}
    }
  ]
}
```

These mechanisms can be used to perform arbitrarily complex joins, see their respective reference documentation for more details.

The rest of this section will demonstrate how GROQ can be used to implement joins equivalent to those in relational algebra and SQL databases. In the following examples, the "left relation" will refer to the current document, while the "right relation" will refer to the joined documents.  test

## Outer Joins

### Left Outer Join

A left outer join combines each document in the left relation with any documents in the right relation that match the join condition. Documents in the left relation that do not have any corresponding matches in the right relation are still included in the result, typically with a `null` value or similar.

The simplest left outer join is made with the reference access operator `->`, which joins the referenced document from the right relation into the left relation, or `null` if the referenced document does not exist. For example, the following query fetches all employees and joins them with their referenced department, if any:

```
*[ _type == "employee" ]{ ..., department-> }

```

Left outer joins can also use arbitrary join conditions through subqueries. For example, the following query joins all departments which reference an employee in its `employees` array:

```
*[ _type == "employee" ]{
  ...,
  "departments": *[ _type == "department" && ^._id in employees[]._ref ],
}
```

### Right Outer Joins

Right outer joins are identical to left outer joins, except that the left and right relations are swapped. Right outer joins are not directly supported in GROQ, but the same effect is easily accomplished by using a left outer join with the left and right relations swapped.

### Full Outer Joins

Full outer joins fetch all documents in both the left and right relations, and combine them on matching join conditions. Full outer joins do not directly translate to a document database, since the result is not a two-dimensional set of tuples. However, a similar effect can be obtained by fetching all documents in both relations and joining any matches using projection conditionals.

For example, the following query fetches all `employee` documents and all `department` documents, then joins referenced departments into employees via the `->` operator, and employees into departments via a subquery using `^`:

```
*[ _type in ["employee", "department" ]{
  ...,
  _type == "employee" => {
    department->,
  },
  _type == "department" => {
    "employees": *[ _type == "employee" && department._ref == ^._id ],
  },
}
```

## Inner Joins

### Equijoins

Equijoins combine documents in the left relation with documents in the right relation that match on an equality condition. Documents in the left relation that do not match any documents in the right relation are not included. This is accomplished in GROQ by using a left outer join and then filtering out any documents which did not have any matches - for example:

```
*[ _type == "employee" ]{ ..., department-> }[ !defined(department) ]

```

The equality can be made explicit by using a subquery instead of the `->` access operator:

```
*[ _type == "employee" ]{
  ...,
  "department": *[ _type == "department" && _id == ^.department._ref ][0],
}[ !defined(department) ]

```

### Non-Equijoins

Non-equijoins are similar to equijoins, except they join on inequalities rather than equalities (e.g. `>`, `<`, or `!=`). For example, the following query joins employees with all departments whose `baseSalary` field is greater than the employee's `salary` field, and removes employees which do not match the join condition:

```
*[ _type == "employee" ]{
  ...,
  "betterDepartments": *[ _type == "department" && baseSalary > ^.salary ],
}[ count(betterDepartments) > 0 ]
```

### θ-joins

θ-joins are similar to equijoins and non-equijoins, except they join documents on any arbitrary join condition. For example, the following query joins employees with any departments whose `baseSalary` is higher than the employee's `salary`, whose `manager` is not equal to the employee's `boss`, and whose `city` field is equal to the employee's `city` field:

```
*[ _type == "employee" ]{
  ...,
  "betterDepartments": *[
    _type == "department"
    && baseSalary > ^.salary
    && manager != ^.boss
    && city == ^.city
  ],
}[ count(betterDepartments) > 0 ]
```

### Semijoins

A semijoin checks whether a document in the left relation matches one in the right relation on the join condition, but does not actually include any contents from the right relation in the result. Semijoins are performed by including joins in a GROQ filter, for example in the following query that fetches all employees that belong to the `finance` department:

```
*[ _type == "employee" && department->_id == "finance" ]

```

Semijoins can also be done with subqueries, like the following example which fetches employees that are contained within the `employees` array of at least one department.

```
*[ _type == "employee" && count(*[ _type == "department" && ^._id in employees[]._ref ]) > 0 ]

```

### Antijoins

Antijoins are similar to semijoins, except they check whether the document in the left relation does *not* match any documents in the right relation on the join condition. For example, the following query fetches all employees that do not belong to any department:

```
*[ _type == "employee" && !defined(department->) ]

```

Antijoins can also be done with subqueries, like the following example which fetches employees that are not contained within the `employees` array of any department.

```
*[ _type == "employee" && count(*[ _type == "department" && ^._id in employees[]._ref ]) == 0 ]

```

### Natural Joins

Natural joins combine documents that have common fields with equal values. Natural joins as traditionally defined are not supported by GROQ, but a similar effect can be accomplished using the `references()` function which checks whether a document contains a reference to a given document anywhere within it.

For example, the following query fetches any employees that contain any references to the department anywhere in their structure, and removes departments with no employees:

```
*[ _type == "department" ]{
  ...,
  "employees": *[ _type == "employee" && references(^._id) ],
}[ count(employees) > 0 ]

```

## Other Joins

### Self-joins

Self-joins join documents against other documents in the same relation. For example, the following query fetches employees whose `salary` values are greater than the currently considered employee:

```
*[ _type == "employee" ]{
  ...,
  "betterPaid": *[ _type == "employee" && salary > ^.salary ],
}

```

Self-joins can even join against the same document, like in the following contrived example:

```
*[ _type == "employee" ]{ ..., "self": *[ _id == ^._id ][0] }
```

### Cross Joins

Cross joins (or Carthesian products) join all documents in the left relation with all documents in the right relation. For example, the following query fetches all employees and joins them with all departments:

```
*[ _type == "employee" ]{..., "allDepartments": *[ _type == "department" ]}

```

