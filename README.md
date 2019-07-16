<h2 align="center">Node module cleaner</h2>

**Small**

**No dependencies**

Meant to reduce attack surface of files left over from a yarn install.

Some examples of using unused code in an attack include

- [Event stream](https://schneider.dev/blog/event-stream-vulnerability-explained/)
- [prototype pollution](https://github.com/HoLyVieR/prototype-pollution-nsec18/blob/master/paper/JavaScript_prototype_pollution_attack_in_NodeJS.pdf)
  attack by utilizing a file in a test directory

# Why

When node modules are published by default the following are [ignored](https://npm.github.io/publishing-pkgs-docs/publishing/the-npmignore-file.html).
However most people do not ignore folders that are not useful for the runtime of the library.

**Test directories, example directories, documentation files, hidden files, CI/CD files, development configurations, License, readmes, etc are often included.**

Removing unneeded files helps reduce storage requirements and attack surface. In this project itself, running this program will reduce the node_modules folder from `142MB` to `114MB`.

# Warnings

- It is pretty much impossible to tell which files are definitely not needed in the runtime of a dependency. It is entirely possible for a library program to read a markdown file for whatever reasons.

- **Test your code thoroughly before using this in production.**

# What is removed

- folders called test, tests, doc, docs, example, examples
- markdown
- map files
- all hidden files, files beginning with a period
- files with no extension.
- C++ and C source/header files

# Install

npm: `npm install node-modules-cleaner`

Yarn: `yarn add node-modules-cleaner`

# Usage

in your `package.json` include a `postinstall` script like so

```json
{
  "scripts": {
    "postinstall": "nmc"
  }
}
```

# Notes

_There are a lot of dev dependencies not being used, they are included as part of the testing of this script._
