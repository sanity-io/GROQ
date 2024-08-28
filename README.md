# GROQ specification

👉🏻 **Published versions of the spec can be viewed [here](https://spec.groq.dev)**.

This is the specification for GROQ (Graph-Relational Object Queries), a query language and execution engine made at [Sanity.io](https://www.sanity.io), for filtering and projecting JSON documents.
The work started in 2015, and the development of this open standard started in 2019.
Read the [announcement blog post](https://www.sanity.io/blog/we-re-open-sourcing-groq-a-query-language-for-json-documents) to understand more about the specification process and see the [getting started guide](https://www.sanity.io/docs/how-queries-work) to learn more about the language itself.

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
The source is located under the `spec/`-directory which is then converted into HTML and presented at <https://spec.groq.dev>.
To ensure that implementations are compatible we write test cases in the [GROQ test suite](https://github.com/sanity-io/groq-test-suite).

The specification follows the versioning scheme of **GROQ-X.revisionY** where X (major) and Y (revision) are numbers:

- The first version is GROQ-1.revision0.
- Later revisions are always backwards compatible with earlier revisions in the same major version.
- Revisions can include everything from minor clarifications to whole new functionality.
- Major versions are used to introduce breaking changes.

## License

The specification is made available under the Open Web Foundation Final Specification Agreement (OWFa 1.0). 
# GROQ (Graph-Relational Object Queries)

This project aims to provide a query language and execution engine for filtering and projecting JSON documents.

## Installation

To install the necessary dependencies, run:
```bash
npm install

Usage
To start using GROQ, follow the instructions in the getting started guide.

Contributing
Contributions are welcome! Please fork this repository and submit a pull request.

License
This project is licensed under the Open Web Foundation Final Specification Agreement (OWFa 1.0).


### 2. Improve the GitHub Actions Workflow
You can add more steps to your CI workflow to improve code quality, such as linting and building the project.

```yaml
name: CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'

    - name: Install dependencies
      run: npm install

    - name: Lint code
      run: npm run lint

    - name: Run tests
      run: npm test

    - name: Build project
      run: npm run build

3. Add Linting and Testing Scripts
Ensure your package.json includes scripts for linting and testing.

JSON

{
  "name": "groq",
  "version": "1.0.0",
  "description": "A query language and execution engine for filtering and projecting JSON documents",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1",
    "lint": "eslint .",
    "build": "webpack --config webpack.config.js"
  },
  "author": "sanity-io",
  "license": "OWFa 1.0",
  "devDependencies": {
    "eslint": "^7.32.0",
    "webpack": "^5.38.1",
    "webpack-cli": "^4.7.2"
  }
}
AI-generated code. Review and use carefully. More info on FAQ.
