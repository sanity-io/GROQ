Operators
-------

# Operators

## And operator

And : Expression `&&` Expression

EvaluateAnd(scope):

* Let {leftNode} be the first {Expression}.
* Let {left} be the result of {Evaluate(leftNode, scope)}.
* Let {rightNode} be the last {Expression}.
* Let {right} be the result of {Evaluate(rightNode, scope)}.
* If {left} or {right} is {false}:
  * Return {false}.
* If {left} or {right} is not a boolean:
  * Return {null}.
* Return {true}.

## Or operator

Or : Expression `||` Expression

EvaluateOr(scope):

* Let {leftNode} be the first {Expression}.
* Let {left} be the result of {Evaluate(leftNode, scope)}.
* Let {rightNode} be the last {Expression}.
* Let {right} be the result of {Evaluate(rightNode, scope)}.
* If {left} or {right} is {true}:
  * Return {true}.
* If {left} or {right} is not a boolean:
  * Return {null}.
* Return {false}.

## Not operator

Not : `!` Expression

EvaluateNot(scope):

* Let {valueNode} be the {Expression}.
* Let {value} be the result of {Evaluate(valueNode, scope)}.
* If {value} is {false}:
  * Return {true}.
* If {value} is {true}:
  * Return {false}.
* Return {null}.

## Equality operators

Equality : Expression EqualityOperator Expression

EqualityOperator : one of `==`, `!=`

EvaluateEquality(scope):

* Let {leftNode} be the first {Expression}.
* Let {left} be the result of {Evaluate(leftNode, scope)}.
* Let {rightNode} be the last {Expression}.
* Let {right} be the result of {Evaluate(rightNode, scope)}.
* Let {result} be the result of {Equal(left, right)}.
* If the operator is `!=`:
  * If {result} is {true}:
      * Return {false}.
  * If {result} is {false}:
      * Return {true}.
* Return {result}.

## Comparison operators

Comparison : Expression ComparisonOperator Expression

ComparisonOperator : one of `<`, `<=`, `>`, `>=`

EvaluateComparison(scope):

* Let {leftNode} be the first {Expression}.
* Let {left} be the result of {Evaluate(leftNode, scope)}.
* Let {rightNode} be the last {Expression}.
* Let {right} be the result of {Evaluate(rightNode, scope)}.
* Let {cmp} be the result of {PartialCompare(left, right)}.
* If {cmp} is {null}:
  * Return {null}.
* If {cmp} is {Less} and the operator is {<} or {<=}:
  * Return {true}.
* If {cmp} is {Greater} and the operator is {>} or {>=}:
  * Return {true}.
* If {cmp} is {Equal} and the operator is {<=} or {>=}:
  * Return {true}.
* Return {false}.

## In operator

In : Expression in Expression

EvaluateIn(scope):

* Let {leftNode} be the first {Expression}.
* Let {left} be the result of {Evaluate(leftNode, scope)}.
* Let {rightNode} be the last {Expression}.
* Let {right} be the result of {Evaluate(rightNode, scope)}.
* If {right} is an array:
  * For each {value} in {right}:
      * If {Equal(left, value)} is {true}:
          * Return {true}.
  * Return {false}.
* If {right} is a range:
  * Let {lower} be the start value of {right}.
  * Let {upper} be the end value of {right}.
  * Let {leftCmp} be the result of {PartialCompare(left, lower)}.
  * Let {rightCmp} be the result of {PartialCompare(left, upper)}.
  * If {leftCmp} or {rightCmp} is {null}:
      * Return null.
  * If {leftCmp} is {Less}:
      * Return {false}.
  * If {rightCmp} is {Greater}:
      * Return false.
  * If the {right} range is exclusive and {rightCmp} is {Equal}:
      * Return {false}.
  * Return {true}.
* Return {null}.

## Match operator

Match : Expression match Expression

## Asc operator

The asc operator is used by the {order()} function to signal that you want ascending sorting. Evaluating it in any other context returns {null}.

Asc : Expression `asc`

EvaluateAsc(scope):

* Return {null}.

## Desc operator

The desc operator is used by the {order()} function to signal that you want descending sorting. Evaluating it in any other context returns {null}.

Desc : Expression `desc`

EvaluateDesc(scope):

* Return {null}.

## Unary plus operator

UnaryPlus : `+` Expression

EvaluateUnaryPlus(scope):

* Let {valueNode} be the {Expression}.
* Let {value} be the result of {Evaluate(valueNode, scope)}.
* If {value} is a number:
  * Return {value}.
* Return {null}.

## Unary minus operator

UnaryMinus : `-` Expression

EvaluateUnaryMinus(scope):

* Let {valueNode} be the {Expression}.
* Let {value} be the result of {Evaluate(valueNode, scope)}.
* If {value} is a number:
  * Return {value} with opposite sign.
* Return {null}.

## Binary plus operator

Plus : Expression `+` Expression

EvaluatePlus(scope):

* Let {leftNode} be the first {Expression}.
* Let {left} be the result of {Evaluate(leftNode, scope)}.
* Let {rightNode} be the last {Expression}.
* Let {right} be the result of {Evaluate(rightNode, scope)}.
* If both {left} and {right} are strings:
  * Return the string concatenation of {left} and {right}.
* If both {left} and {right} are numbers:
  * Return the addition of {left} and {right}.
* Return {null}.

## Binary minus operator

Minus : Expression `-` Expression

EvaluateMinus(scope):

* Let {leftNode} be the first {Expression}.
* Let {left} be the result of {Evaluate(leftNode, scope)}.
* Let {rightNode} be the last {Expression}.
* Let {right} be the result of {Evaluate(rightNode, scope)}.
* If both {left} and {right} are numbers:
  * Return the subtraction of {left} from {right}.
* Return {null}.

## Binary star operator

Star : Expression `*` Expression

EvaluateStar(scope):

* Let {leftNode} be the first {Expression}.
* Let {left} be the result of {Evaluate(leftNode, scope)}.
* Let {rightNode} be the last {Expression}.
* Let {right} be the result of {Evaluate(rightNode, scope)}.
* If both {left} and {right} are numbers:
  * Return the multiplication of {left} and {right}.
* Return null.

## Binary slash operator

Slash : Expression `/` Expression

EvaluateSlash(scope):

* Let {leftNode} be the first {Expression}.
* Let {left} be the result of {Evaluate(leftNode, scope)}.
* Let {rightNode} be the last {Expression}.
* Let {right} be the result of {Evaluate(rightNode, scope)}.
* If both {left} and {right} are numbers:
  * Return the division of {left} by {right}.
* Return {null}.

## Binary percent operator

Percent : Expression `%` Expression

EvaluatePercent(scope):

* Let {leftNode} be the first {Expression}.
* Let {left} be the result of {Evaluate(leftNode, scope)}.
* Let {rightNode} be the last {Expression}.
* Let {right} be the result of {Evaluate(rightNode, scope)}.
* If both {left} and {right} are numbers:
  * Return the remainder of {left} after division by {right}.
* Return {null}.

## Binary double star operator

StarStar : Expression `**` Expression

EvaluateStarStar(scope):

* Let {leftNode} be the first {Expression}.
* Let {left} be the result of {Evaluate(leftNode, scope)}.
* Let {rightNode} be the last {Expression}.
* Let {right} be the result of {Evaluate(rightNode, scope)}.
* If both {left} and right are numbers:
  * Return the exponentiation of {left} to the power of {right}.
* Return {null}.

## Dereference operator

Dereference : Expression `->`  String?

EvaluateDereference(scope):

* Let {valueNode} be the {Expression}.
* Let {value} be the result of {Evaluate(valueNode, scope)}.
* If {value} is not an object:
  * Return {null}.
* If {value} does not have an attribute "_ref":
  * Return {null}.
* Let {ref} be the value of the attribute "_ref" in {value}.
* If {ref} is not a string:
  * Return {null}.
* Let {dataset} be the dataset of the query context of {scope}.
* If {dataset} is not an array:
  * Return {null}.
* Let {result} be {null}.
* For each {document} in {dataset}:
  * If {document} is an object and has an attribute "_id":
      * Let {id} be the value of the attribute "_id" in {document}.
    * If {Equal(ref, id)} is {true}:
          * Set {result} to {document}.
      * Stop the loop.
* If the dereference expression contains a {String}:
  * Let {name} be the string value of the {String}.
  * If {result} is an object and contains an attribute {name}:
      * Return the {value} of the attribute {name} in {result}.
  * Otherwise:
      * Return {null}.
* Return {result}.

