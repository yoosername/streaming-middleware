### Example 1 - Simple CLI with plugins
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
