# Precedence and associativity

In this specification the various expressions and operators are defined in ambiguously in terms on precedence and associativity. The table below describes the precedence levels used to determine the correct unambiguous interpretation.

From highest to lowest:

- Level 11: [Compound expressions](#sec-Compound-expressions).
- Level 10, prefix: `+`, `!`.
- Level 9, right-assoative: [](#sec-Binary-double-star-operator) `**`.
- Level 8, prefix: `-`.
- Level 7, left-associative: Multiplicatives (`*`, `/`, `%`).
- Level 6, left-associative: Additives (`+`, `-`),
- Level 5, non-associative: Ranges (`..`, `...`).
- Level 4, non-associative: Comparisons (`==`, `!=`, `>`, `>=`,`<`, `<=`, `in`, `match`).
- Level 4, postfix: Ordering (`asc`, `desc`).
- Level 3, left-associative: `&&`.
- Level 2, left-associative: `||`.
- Level 1, non-associative: `=>`.
