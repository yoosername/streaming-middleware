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


## Example usage
```javascript
var StreamingMiddleware = require('./StreamingMiddleware.js');
var app = StreamingMiddleware();

var testDataIn = {count: 0};
var options = {objectMode: true};

// Add some middleware transform functions
app.use(function(chunk, enc, next){
  var obj = chunk;
  obj.count++; // add 1 to count
  next(null, obj);
})
app.use(function(chunk, enc, next){
  var obj = chunk;
  obj.count++; // add 1 to count
  next(null, obj);
})

// Create a new stream using object mode
var stream = app.stream(options);

// Pipe the output of the stream to  console.
stream.pipe(process.out); // {count : 2}

// Now write the test data to the stream.
stream.write(testDataIn);
```
