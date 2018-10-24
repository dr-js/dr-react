# dr-react

[![i:npm]][l:npm]
[![i:size]][l:size]
[![i:lint]][l:lint]

A collection of strange functions, with React

[i:npm]: https://img.shields.io/npm/v/dr-react.svg
[l:npm]: https://npm.im/dr-react
[i:size]: https://packagephobia.now.sh/badge?p=dr-react
[l:size]: https://packagephobia.now.sh/result?p=dr-react
[i:lint]: https://img.shields.io/badge/code_style-standard_ES6+-yellow.svg
[l:lint]: https://standardjs.com

[//]: # (NON_PACKAGE_CONTENT)

- 📁 [source/](source/)
  - main source code, in output package will be:
    - `dr-react/library`: for direct use, use `require() / exports.*=` and has `Dr.browser.js`
    - `dr-react/module`: for re-pack, keep `import / export` and readability
- 📁 [example/](example/)
  - some example (unsorted tests)
- 📄 [SPEC.md](SPEC.md)
  - list of all directly accessible codes, sort of an API lockfile
