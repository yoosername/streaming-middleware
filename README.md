# StreamingMiddleware.js

A simple example of generic middleware which is assembled like express middleware and then can be used as a stream.

## Why

Wanted a way to:

* Use runtime modules as part of a CLI to extend functionality
* Turn simple JS function modules into transform streams
* Automatically connect them up together so you write to first in stack and read from last.

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


## Example usage (app.js)
```javascript
var StreamingMiddleware = require('.StreamingMiddleware.js');
var through2 = require("through2");
var app = StreamingMiddleware();

var count = (process.argv.length > 2) ? parseInt(process.argv[2]) : 1;
var addAmount = (process.argv.length > 3) ? parseInt(process.argv[3]) : 1;

var testDataIn = {count: count};
var options = {objectMode: true};

// Add some middleware transform functions
app.use(function(chunk, enc, next){
  var obj = chunk;
  obj.count = obj.count + addAmount; // increment count by chosen amount
  next(null, obj);
})
app.use(function(chunk, enc, next){
  var obj = chunk;
  obj.count = obj.count + addAmount; // increment count by chosen amount
  next(null, obj);
})

// Create a new stream using object mode
var stream = app.stream(options);

// Pipe the output of the stream to  console.
stream.pipe(through2.obj(function(chunk, encoding, callback) {
    this.push(JSON.stringify(chunk) + '\n')
    callback()
}))
.pipe(process.stdout); // {count : (count + addAmount + addAmount)}

// Now write the test data to the stream.
stream.write(testDataIn);
```

Run with
```bash
node app.js
```
