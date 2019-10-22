GROQ
-------

*Current Working Draft*

This is the specification for GROQ (**G**raph-**R**elational **O**bject **Q**ueries), a query language and execution engine made at Sanity, Inc, for filtering and projecting JSON documents. The work started in 2015. The development of this open standard started in 2019.

GROQ is authored by [Alexander Staubo](https://twitter.com/purefiction) and [Simen Svale Skogsrud](https://twitter.com/svale). Additional follow up work by [Erik Grinaker](https://twitter.com/erikgrinaker) and [Magnus Holm](https://twitter.com/judofyr).

This specification should be considered *work in progress* until the first release.

**Copyright notice**

Copyright © 2015–present, Sanity, Inc.

As of July 9, 2010, the following persons or entities have made this Specification available under the Open Web Foundation Final Specification Agreement (OWFa 1.0), which is available at [openwebfoundation.org](http://www.openwebfoundation.org/legal/the-owf-1-0-agreements/owfa-1-0).

* Sanity, Inc.

You can review the signed copies of the Open Web Foundation Final Specification Agreement Version 1.0 for this specification at [github.com/sanity-io/GROQ](https://github.com/sanity-io/GROQ), which may also include additional parties to those listed above.

Your use of this Specification may be subject to other third party rights. THIS SPECIFICATION IS PROVIDED “AS IS.” The contributors expressly disclaim any warranties (express, implied, or otherwise), including implied warranties of merchantability, non‐infringement, fitness for a particular purpose, or title, related to the Specification. The entire risk as to implementing or otherwise using the Specification is assumed by the Specification implementer and user. IN NO EVENT WILL ANY PARTY BE LIABLE TO ANY OTHER PARTY FOR LOST PROFITS OR ANY FORM OF INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES OF ANY CHARACTER FROM ANY CAUSES OF ACTION OF ANY KIND WITH RESPECT TO THIS SPECIFICATION OR ITS GOVERNING AGREEMENT, WHETHER BASED ON BREACH OF CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE, AND WHETHER OR NOT THE OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

**Conformance**

A conforming implementation of GROQ must fulfill all normative requirements. Conformance requirements are described in this document via both descriptive assertions and key words with clearly defined meanings.

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in the normative portions of this document are to be interpreted as described in [IETF RFC 2119](https://tools.ietf.org/html/rfc2119). These key words may appear in lowercase and still retain their meaning unless explicitly declared as non‐normative.

A conforming implementation of GROQ may provide additional functionality, but must not where explicitly disallowed or would otherwise result in non‐conformance.

**Conforming Algorithms**

Algorithm steps phrased in imperative grammar (e.g. “Return the result”) are to be interpreted with the same level of requirement as the algorithm it is contained within. Any algorithm referenced within an algorithm step (e.g. “Let completedResult be the result of calling CompleteValue()”) is to be interpreted as having at least the same level of requirement as the algorithm containing that step.

Conformance requirements expressed as algorithms can be fulfilled by an implementation of this specification in any way as long as the perceived result is equivalent. Algorithms described in this document are written to be easy to understand. Implementers are encouraged to include equivalent but optimized implementations.

# [Overview](Section%201%20--%20Overview.md)

# [Syntax](Section%202%20--%20Syntax.md)

# [Execution](Section%203%20--%20Execution.md)

# [Data types](Section%204%20--%20Data%20types.md)

# [Equality and comparison](Section%205%20--%20Equality%20and%20comparison.md)

# [Simple expressions](Section%206%20--%20Simple%20expressions.md)

# [Compound expressions](Section%207%20--%20Compound%20expressions.md)

# [Operators](Section%208%20--%20Operators.md)

# [Precedence and associativity](Section%209%20--%20Precedence%20and%20associativity.md)

# [Functions](Section%2010%20--%20Functions.md)

# [Pipe functions](Section%2011%20--%20Pipe%20functions.md)

# [Vendor functions](Section%2012%20--%20Vendor%20functions.md)

