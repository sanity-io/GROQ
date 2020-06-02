Equality and comparison
-------

# Equality and comparison

GROQ provides trivial equality and comparison between numbers, strings and booleans. Other types are considered inequal or incomparable to each other. Incomparability between values are represented by operators returning {null} (e.g. `2 > "1"` is {null}).

## Equality

Simple values such as numbers, strings, booleans and {null} are equal when they contain the same data. All other values are considered inequal to each other (e.g. `[] != []`).

Note: In GROQ `1 == null` returns `false` (which is different from e.g. SQL). 

Equal(a, b):

* If both {a} and {b} is {null}:
  * Return {true}.
* Let {cmp} be the result of {PartialCompare(a, b)}.
* If {cmp} is {Equal}:
  * Return {true}.
* Otherwise:
  * Return {false}.

## Partial comparison

A partial comparison between two values return either {Greater}, {Equal}, {Less} or {null}. {null} represents that the values are incomparable to each other. This is used by the comparison operators (<, <=, >, >=).

PartialCompare(a, b):

* If the type of {a} is different from the type of {b}:
  * Return {null}.
* If  {a} is a number:
  * If a < b:
      * Return {Less}.
  * If a > b:
      * Return {Greater}.
  * If a = b:
      * Return {Equal}.
* If {a} is a string:
  * For each Unicode code point ({aCodePoint}, {bCodePoint}) in {a} and {b}:
      * If {aCodePoint} < {bCodePoint}:
          * Return {Less}.
    * If {aCodePoint} > {bCodePoint}:
          * Return {Greater}.
  * If {a} is shorter than {b}:
      * Return {Less}.
  * If {a} is longer than {b}:
      * Return {Greater}.
  * Return {Equal}.
* If {a} is a boolean:
  * Return the comparison between {a} and {b} with {false} < {true}.
* Return {null}.

## Total comparison

A total comparison between two values return either {Greater}, {Equal} or {Less}. It provides a consistent ordering of values of different types (for string, numbers and boolean) and considers all other types to be equal to each other. This is used by the {order()} function.

TypeOrder(val):

* If {val} is number:
  * Return 1.
* If {val} is a string:
  * Return 2.
* If {val} is a boolean:
  * Return 3.
* Return 4.

TotalCompare(a, b):

* Let {aTypeOrder} be the result of {TypeOrder(a)}.
* Let {bTypeOrder} be the result of {TypeOrder(b)}.
* If {aTypeOrder} != {bTypeOrder}:
  * Return the result of {PartialCompare(aTypeOrder, bTypeOrder)}.
* Let {result} be the result of {PartialCompare(a, b)}.
* If {result} is {null}:
  * Return {Equal}.
* Otherwise:
  * Return {result}.

