# GROQ specification

👉🏻 **Published versions of the spec can be viewed [here](https://sanity-io.github.io/GROQ/)**.

This is the specification for GROQ (Graph-Relational Object Queries), a query language and execution engine made at [Sanity.io](https://www.sanity.io), for filtering and projecting JSON documents.
The work started in 2015, and the development of this open standard started in 2019.
Read the [announcement blog post](https://www.sanity.io/blog/we-re-open-sourcing-groq-a-query-language-for-json-documents) to understand more about the specification process and see the [getting started guide](https://www.sanity.io/docs/data-store/how-queries-work) to learn more about the language itself.

Go to [GROQ Arcade](https://groq.dev) to try out GROQ with any JSON data today!

## Tools and resources for GROQ

* [Syntax highlighting in VS Code](https://github.com/sanity-io/vscode-sanity).
* [Syntax highlighting in Sublime Text](https://github.com/alevroub/groq-syntax-highlighting).
* [GROQ tagged template literal](https://www.npmjs.com/package/groq), for writing GROQ queries in JavaScript files.
* [groq-cli](https://github.com/sanity-io/groq-cli), a command-line tool for running GROQ on files and URLs.
* [groq-js](https://github.com/sanity-io/groq-js), a JavaScript implementation of GROQ.
* [Go GROQ library](https://github.com/sanity-io/go-groq), a Go implementation of the GROQ parser.
* [groqfmt](https://github.com/sanity-io/groqfmt), a command-line formatter for GROQ, written in Go.

## Development of the specification

The specification is written using [spec-md](https://spec-md.com), a Markdown variant optimized for writing specifications.
The source is located under the `spec/`-directory which is then converted into HTML and presented at <https://sanity-io.github.io/GROQ/>.
To ensure that implementations are compatible we write test cases in the [GROQ test suite](https://github.com/sanity-io/groq-test-suite).

The specification follows the versioning scheme of **GROQ-X.revisionY** where X (major) and Y (revision) are numbers:

- The first version is GROQ-1.revision0.
- Later revisions are always backwards compatible with earlier revisions in the same major version.
- Revisions can include everything from minor clarifications to whole new functionality.
- Major versions are used to introduce breaking changes.

## License

The specification is made available under the Open Web Foundation Final Specification Agreement (OWFa 1.0).
