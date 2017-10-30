var StreamingMiddleware = require('../StreamingMiddleware.js');
var through2 = require("through2");
var app = StreamingMiddleware();

var count = (process.argv.length > 2) ? parseInt(process.argv[2]) : 1;
var addAmount = (process.argv.length > 3) ? parseInt(process.argv[3]) : 1;

var testDataIn = {count: count};
var options = {objectMode: true};

// Add some middleware transform functions
app.use(function(chunk, enc, next){
  var obj = chunk;
  obj.count = obj.count + addAmount; // increment count
  next(null, obj);
})
app.use(function(chunk, enc, next){
  var obj = chunk;
  obj.count = obj.count + addAmount; // increment count
  next(null, obj);
})

// Create a new stream using object mode
var stream = app.stream(options);

// Pipe the output of the stream to  console.
stream.pipe(through2.obj(function(chunk, encoding, callback) {
    this.push(JSON.stringify(chunk) + '\n')
    callback()
}))
.pipe(process.stdout); // {count : 2}

// Now write the test data to the stream.
stream.write(testDataIn);
