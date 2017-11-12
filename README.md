[![Build Status](https://travis-ci.org/yoosername/streaming-middleware.svg?branch=master)](https://travis-ci.org/yoosername/streaming-middleware)

# streaming-middleware
Compose a chain of Transform Streams with Express-like middleware.

## Usage
app.js
```javascript
var StreamingMiddleware = require("../StreamingMiddleware.js");
var app = StreamingMiddleware();

app
  .use(function Uppercase(chunk, enc, next){
    next(null, chunk.toString().toUpperCase() );
  })
  .use(function Reverse(chunk, enc, next){
    next(null, chunk.toString().split("").reverse().join("").trim("") + "\n" );
  })

process.stdin.pipe(app.stream()).pipe(process.stdout);
```

```bash
echo "pickle rick" | node app.js      // # KCIR ELKCIP
```

## Build & Test
```bash
npm install
npm test

# or
npm install -g mocha
mocha test/**/*spec.js --reporter spec
# or
mocha test/**/*spec.js --reporter=nyan
```

## Api
TODO

## Examples
See [more examples in the Example folder](https://github.com/yoosername/streaming-middleware/blob/master/examples/EXAMPLES.md)


## Why
* Experimenting with creating an easily extendable CLI for processing streamed data
* Experimenting with a test driven approach

## Todo
* Increase test coverage
* Ability to use class or function that extends TransformStream as well as plain JS function
* Reduce external dependencies to zero
