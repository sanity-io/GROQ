Parameters
-------

# Parameters

Parameters are client-provided values that are substituted into queries before execution. Their names must begin with `$` followed by a valid identifier, and their values must be JSON literals of any type (take care to quote strings). Since they are JSON literals they can only contain values, not arbitrary GROQ expressions, and are safe to pass from user input.

For example, the following query may be given parameters such as `$type="myType"` and `$object={"title": "myTitle", "value": 3}`:

```
*[ _type == $type && title == $object.title && value > $object.value ]
```

