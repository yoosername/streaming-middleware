# streaming-middleware

Enables generic app middleware to be assembled like Express middleware and then be composed into a single transform stream.

## Why

Wanted a way to:

* Easily extend functionality of a CLI at runtime with user defined modules
* Automatically convert simple exported functions into transform streams
* Automatically connect them up together so you can write data into start of stack and read from end of stack.
* Ability to reuse functions as object and non object streams and in different orders

## Build
```bash
npm install
```

## Test
```bash
npm install -g mocha
npm test

# or
mocha --reporter=nyan
```


## Example usage
### Example 1 - Extend a CLI by referring to plugin modules
#### examples/cli-extended-with-plugins.js
```javascript
var program = require('commander');
var path = require("path");
var StreamingMiddleware = require("../StreamingMiddleware.js");
var app = StreamingMiddleware();

function addMiddlewareToStack(middleware, collection) {
  app.use(path.resolve(__dirname, middleware));
}

program
  .version('0.0.1')
  .option('-p, --plugin [plugin]', 'Add plugin to middleware chain', addMiddlewareToStack, [])
  .parse(process.argv);

process.stdin.pipe(app.stream()).pipe(process.stdout);
```

#### examples/plugin-uppercase.js
```javascript
function Uppercase(chunk, enc, next){

  next(null, chunk.toString().toUpperCase() );

}

module.exports = Uppercase;
```

#### examples/plugin-reverse.js
```javascript
function Uppercase(chunk, enc, next){

  next(null, chunk.toString().split("").reverse().join("").trim("") + "\n" );

}

module.exports = Uppercase;
```
#### Usage
```bash
echo "pickle rick" | node cli-extended-with-plugins.js --plugin ./plugin-uppercase.js --plugin ./plugin-reverse.js
# KCIR ELKCIP
```

### Example 2: Extend a CLI with inline code
#### examples/cli-extended-with-inline-functions.js
```javascript
var program = require('commander');
var path = require("path");
var StreamingMiddleware = require("../StreamingMiddleware.js");
var app = StreamingMiddleware();

function addMiddlewareToStack(middleware, collection) {
  middleware = middleware.replace('$','chunk');
  var func = Function("chunk","enc","next","next(null," + middleware + ")");
  app.use(func);
}

program
  .version('0.0.1')
  .option('-f, --function [function]', 'apply function to stream', addMiddlewareToStack, [])
  .parse(process.argv);

process.stdin.pipe(app.stream()).pipe(process.stdout);
```

### Usage
```bash
echo "tiny rick" | node cli-extended-with-inline-plugins.js -f '$.toString().toUpperCase()' -f '$.toString().split("").reverse().join("").trim() + "\n"'
# KCIR YNIT
```
