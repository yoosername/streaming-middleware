# StreamingMiddleware.js

A simple example of generic middleware which is assembled like express middleware and then can be used as a stream.

## Why

Wanted a way to:

* Easily extend functionality of a CLI at runtime with user defined modules
* Automatically convert simple exported functions into transform streams
* Automatically connect them up together so you can write data into start of stack and read from end of stack.

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
### (examples/cli-extended-with-plugins.js)
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

### (examples/plugin-uppercase.js)
```javascript
function Uppercase(chunk, enc, next){

  next(null, chunk.toString().toUpperCase() );

}

module.exports = Uppercase;
```

### (examples/plugin-reverse.js)
```javascript
function Uppercase(chunk, enc, next){

  next(null, chunk.toString().split("").reverse().join("").trim("") + "\n" );

}

module.exports = Uppercase;
```
### Usage
```bash
cd examples
echo "pickle rick" | node cli-extended-with-plugins.js --plugin ./plugin-uppercase.js --plugin ./plugin-reverse.js
# KCIR ELKCIP
```
