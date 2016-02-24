# babel-plugin-transform-modules-amd
es2015 module tranformer for amd.

## Difference
because of the difference between `es2015 module` and `amd module`，
this plugin don't support `named export` and `default export` at the same time.

- `import * as foo from 'foo'` and `import foo from 'foo'` are equal
- `export foo; export default foo;` will throw: 'amd module don't support `export default foo` and , `export foo` both, please choose one

## Installation

``` sh
$ npm install babel-plugin-transform-modules-amd --save-dev
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["transform-modules-amd"]
}
```

### Via CLI

```sh
$ babel --plugins transform-modules-amd script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["transform-modules-amd"]
});
```


