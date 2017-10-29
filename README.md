# streaming-middleware

A simple example of generic middleware (used like express middleware) but using stream transform functions.

## Why

Because

## Build
```
npm install
```

## Test
```
npm install -g mocha
mocha --reporter=nyan
```


## Example usage
```
var middleware = require('./streaming-middleware.js')();
var dataIn = {count: 0};
var options = {objectMode: true};

// Add some middleware transform functions
middleware.use(function(chunk, enc, next){
  var obj = chunk;
  obj.count++;
  next(null, obj);
})
middleware.use(function(chunk, enc, next){
  var obj = chunk;
  obj.count++;
  next(null, obj);
})

// Retrieve the stream
var stream = middleware.stream(options);

// Log the output of all the transforms
stream.pipe(through(options, function(chunk,enc,next){
  console.log(chunk.count); //  = 2
  done();
}));

// Add some data in
stream.write(dataIn);
```
