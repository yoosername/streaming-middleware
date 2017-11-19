# TOC
   - [GetFunctionArguments](#getfunctionarguments)
   - [MiddlewareChainedStream](#middlewarechainedstream)
   - [StreamingMiddleware](#streamingmiddleware)
     - [#use()](#streamingmiddleware-use)
     - [#stream()](#streamingmiddleware-stream)
   - [TransformStreamWrapper](#transformstreamwrapper)
   - [Validation](#validation)
     - [ValidStack](#validation-validstack)
     - [ValidTransform](#validation-validtransform)
<a name=""></a>
 
<a name="getfunctionarguments"></a>
# GetFunctionArguments
should exist.

```js
expect(GetFunctionArguments).to.not.be.undefined;
```

should be a function.

```js
expect(GetFunctionArguments).to.be.a('function');
```

should return an array.

```js
var actual = GetFunctionArguments(function(arg1,arg2){});
expect(actual).to.be.an('Array');
```

should return correct arg results in array.

```js
var twoArgs = GetFunctionArguments(function(arg1,arg2){});
var threeArgs = GetFunctionArguments(function(arg1,arg2,arg3){});
var fourArgs = GetFunctionArguments(function(arg1,arg2,arg3,arg4){});
expect(twoArgs).to.have.lengthOf(2);
expect(threeArgs).to.have.lengthOf(3);
expect(fourArgs).to.have.lengthOf(4);
expect(twoArgs[0]).to.equal("arg1");
expect(fourArgs[3]).to.equal("arg4");
```

should always return an array no matter what is passed.

```js
expect(GetFunctionArguments([])).to.be.an("array");
expect(GetFunctionArguments([])).to.have.lengthOf(0);
expect(GetFunctionArguments({})).to.be.an("array");
expect(GetFunctionArguments({})).to.have.lengthOf(0);
expect(GetFunctionArguments("")).to.be.an("array");
expect(GetFunctionArguments("")).to.have.lengthOf(0);
expect(GetFunctionArguments(Function())).to.be.an("array");
expect(GetFunctionArguments(Function())).to.have.lengthOf(0);
expect(GetFunctionArguments(function Func(one, two){})).to.have.lengthOf(2);
expect(GetFunctionArguments(null)).to.be.an("array");
expect(GetFunctionArguments(null)).to.have.lengthOf(0);
expect(GetFunctionArguments()).to.be.an("array");
expect(GetFunctionArguments()).to.have.lengthOf(0);
```

<a name="middlewarechainedstream"></a>
# MiddlewareChainedStream
should exist.

```js
expect(MiddlewareChainedStream).to.not.be.undefined;
```

should be a function.

```js
expect(MiddlewareChainedStream).to.be.a('function');
```

should be able to be used with or without new operator.

```js
var withNewOperator = new MiddlewareChainedStream();
expect(withNewOperator).to.be.an.instanceOf(PassThrough);
expect(withNewOperator).to.be.a.ReadableStream;
expect(withNewOperator).to.be.a.WritableStream;
var withoutNewOperator = MiddlewareChainedStream();
expect(withoutNewOperator).to.be.an.instanceOf(PassThrough);
expect(withoutNewOperator).to.be.a.ReadableStream;
expect(withoutNewOperator).to.be.a.WritableStream;
```

should work with or without optional options argument.

```js
var withoutOptionsNoStack = new MiddlewareChainedStream();
        expect(withoutOptionsNoStack).to.be.an.instanceOf(PassThrough);
        var withoutOptionsStack = new MiddlewareChainedStream(validStack);
        expect(withoutOptionsStack).to.be.an.instanceOf(MiddlewareChainedStream);
        var withOptionsStack = new MiddlewareChainedStream({},validStack);
        expect(withOptionsStack).to.be.an.instanceOf(MiddlewareChainedStream);
```

should throw an error if any elements in the stack are not plain function or stream.Transform.

```js
var undef;
        // Object
        expect(function(){MiddlewareChainedStream([{}]);}).to.throw(Error, VALIDATION_ERROR);
        // Object, Function, Array
        expect(function(){MiddlewareChainedStream([{},NoopStreamingMiddleware,[]]);}).to.throw(Error, VALIDATION_ERROR);
        // Function, Function, null
        expect(function(){MiddlewareChainedStream([NoopStreamingMiddleware,NoopStreamingMiddleware,null]);}).to.throw(Error, VALIDATION_ERROR);
        // Function, Function, undefined
        expect(function(){MiddlewareChainedStream([NoopStreamingMiddleware,NoopStreamingMiddleware,undef]);}).to.throw(Error, VALIDATION_ERROR);
        // Function, undefined, Function
        expect(function(){MiddlewareChainedStream([NoopStreamingMiddleware,undef,NoopStreamingMiddleware]);}).to.throw(Error, VALIDATION_ERROR);
        // undefined
        expect(function(){MiddlewareChainedStream([undef]);}).to.throw(Error, VALIDATION_ERROR);
        // null
        expect(function(){MiddlewareChainedStream([null]);}).to.throw(Error, VALIDATION_ERROR);
```

should return a PassthroughStream if stack is empty.

```js
var withNewOperator = new MiddlewareChainedStream({},[]);
expect(withNewOperator).to.be.an.instanceOf(PassThrough);
var withNewOperator = new MiddlewareChainedStream([]);
expect(withNewOperator).to.be.an.instanceOf(PassThrough);
```

should return a MiddlewareChainedStream if stack contains plain functions with correct sig.

```js
var stream = new MiddlewareChainedStream([
  function(chunk,enc,next){
    next(null, chunk.toString().split("").reverse().join(""));
  }
]);
expect(stream).to.be.an.instanceOf(MiddlewareChainedStream);
var stream2 = new MiddlewareChainedStream([
  function(chunk,enc,next){
    next(null, chunk.toString().split("").reverse().join(""));
  },
  function(chunk,enc,next){
    next(null, chunk.toString().toUpperCase());
  },
]);
expect(stream2).to.be.an.instanceOf(MiddlewareChainedStream);
```

should return a MiddlewareChainedStream if stack contains Transform instances.

```js
function TestTransform(options){
          Transform.call(this, options);
        }
        util.inherits(TestTransform, Transform);
        TestTransform.prototype._transform = function(data, encoding, callback) {
          callback(null, data);
        };
        var transform1 = new TestTransform();
        var stream = new MiddlewareChainedStream([transform1]);
        expect(stream).to.be.an.instanceOf(MiddlewareChainedStream);
        var transform2 = new TestTransform({objectMode: true});
        var transform3 = new TestTransform({objectMode: true});
        var stream2 = new MiddlewareChainedStream([transform2,transform3]);
        expect(stream2).to.be.an.instanceOf(MiddlewareChainedStream);
        var plainFunction = function(chunk,enc,next){};
        var stream3 = new MiddlewareChainedStream([transform2,plainFunction,transform3]);
        expect(stream3).to.be.an.instanceOf(MiddlewareChainedStream);
```

should pipe data correctly as a Passthrough.

```js
var stream = new MiddlewareChainedStream();
passStream
.pipe(stream)
.pipe(memStream)
.on('finish', function() {
  expect(memStream.toString()).to.eql('test data');
  done();
});
passStream.end(new Buffer('test data'));
```

should pipe data correctly with middleware.

```js
var stream = new MiddlewareChainedStream([
          function(chunk,enc,next){
            next(null, chunk.toString().split("").reverse().join(""));
          },
          function(chunk,enc,next){
            next(null, chunk.toString().toUpperCase());
          },
        ]);
        passStream
        .pipe(stream)
        .pipe(memStream)
        .on('finish', function() {
          expect(memStream.toString()).to.eql('ATAD TSET');
          done();
        });
        passStream.end(new Buffer('test data'));
```

should emit Writable finish event correctly.

```js
var stream = new MiddlewareChainedStream([
          function(chunk,enc,next){
            next(null, chunk.toString().split("").reverse().join(""));
          },
          function(chunk,enc,next){
            next(null, chunk.toString().toUpperCase());
          },
        ]);
        var spy = sinon.spy(stream, "_final");
        stream
        .on('finish', function() {
          expect(spy.called).to.be.true;
          done();
        })
        .on('data', function() {
          //for some reason there has to be a data handler configured or finish event nevers gets called
        });
        for (let i = 0; i < 11; i++) {
          stream.write(`${i}`);
        }
        stream.end();
```

should emit _final event correctly upon end() before finish event.

```js
var stream = new MiddlewareChainedStream([
          function(chunk,enc,next){
            next(null, chunk.toString().split("").reverse().join(""));
          },
          function(chunk,enc,next){
            next(null, chunk.toString().toUpperCase());
          },
        ]);
        var spy = sinon.spy(stream, "_final");
        stream
        .on('finish', function() {
          expect(spy.calledOnce).to.be.true;
          done();
        })
        for (let i = 0; i < 11; i++) {
          stream.write(`${i}`);
        }
        stream.end();
```

should emit data event correctly.

```js
var stream = new MiddlewareChainedStream([
          function(chunk,enc,next){
            next(null, chunk.toString().split("").reverse().join(""));
          },
          function(chunk,enc,next){
            next(null, chunk.toString().toUpperCase());
          },
        ]);
        var input = ["some","input","data"];
        var result = "";
        stream
        .on('data', function(chunk) {
          result += chunk.toString();
        })
        .on('finish', function() {
          expect(result).to.equal("EMOSTUPNIATAD");
          done();
        })
        input.forEach(function(str){
          stream.write(str);
        });
        stream.end();
```

should emit readable event when end of stream reached.

```js
var stream = new MiddlewareChainedStream([
          function(chunk,enc,next){
            next(null, chunk.toString().split("").reverse().join(""));
          },
          function(chunk,enc,next){
            next(null, chunk.toString().toUpperCase());
          },
        ]);
        var input = ["some","input","data"];
        var result = "";
        stream
        .on('readable', function() {
          // read a chunk
          var read = stream.read();
          // if our result already matches the expected string then result should be null
          // which indicates end of the stream has been reached.
          if(result === "EMOSTUPNIATAD"){
            expect(read).to.equal(null);
            done();
          }
          // otherwise just increment the result
          result += read.toString();
        })
        input.forEach(function(str){
          stream.write(str);
        });
        stream.end();
```

should work as a regular writable stream.

```js
var simplePassThrough = new MiddlewareChainedStream([
  function(chunk,enc,next){
    next(null, chunk);
  }
]);
var result = "";
simplePassThrough.on('readable', function(){
  var it = simplePassThrough.read();
  result += (it) ? it : "";
});
simplePassThrough.on('finish', function(){
  expect(result).to.equal('some datasome more datadone writing data');
  done();
});
simplePassThrough.write('some data');
simplePassThrough.write('some more data');
simplePassThrough.end('done writing data');
```

should handle unpipe event.

```js
const simplePassThrough = new MiddlewareChainedStream([
        function(chunk,enc,next){
          next(null, chunk);
        }
      ]);
      const reader = new Readable();
      simplePassThrough.on('unpipe', (src) => {
        expect(src).to.eql(reader);
        done();
      });
      reader.pipe(simplePassThrough);
      reader.unpipe(simplePassThrough);
```

<a name="streamingmiddleware"></a>
# StreamingMiddleware
should exist.

```js
expect(StreamingMiddleware).to.not.be.undefined;
```

should be a function.

```js
expect(StreamingMiddleware).to.be.a('function');
```

should be able to be used with new operator.

```js
var withNewOperator = new StreamingMiddleware();
expect(withNewOperator).to.be.an.instanceOf(StreamingMiddleware);
```

should have an internal _stack property which is initially empty.

```js
var middleware = StreamingMiddleware();
expect(middleware).to.have.property("_stack");
var expected = 0;
var actual = middleware._stack.length;
expect(actual).to.equal(expected);
```

<a name="streamingmiddleware-use"></a>
## #use()
should exist.

```js
var app = StreamingMiddleware();
expect(app).to.respondTo("use");
```

should return (this) for chaining.

```js
var app = StreamingMiddleware();
var obj = app.use(function(chunk,enc,next){});
expect(app).to.eql(obj);
```

should only allow Transform instances or plain function with 3 arguments or throw an error.

```js
var app = StreamingMiddleware();
expect(function(){app.use(NoopStreamingMiddleware)}).to.not.throw();
expect(function(){app.use([])}).to.throw(Error, VALIDATION_ERROR);
expect(function(){app.use(function(){})}).to.throw(Error, VALIDATION_ERROR);
expect(function(){app.use(function(one,two){})}).to.throw(Error, VALIDATION_ERROR);
expect(function(){app.use(function(onw,two,three,four){})}).to.throw(Error, VALIDATION_ERROR);
```

should try to load a module if a string is passed or throw error.

```js
var app = StreamingMiddleware();
var pluginPath = "../examples/plugins/uppercase.js";
var plugin = require("../"+pluginPath);
var CHUNK = "chunk";
plugin(CHUNK,"enc",function(err, chunk){
  expect(chunk).to.equal("CHUNK");
});
expect(function(){app.use(plugin)}).to.not.throw();
expect(function(){app.use(pluginPath)}).to.not.throw();
expect(function(){app.use("random text")}).to.throw(Error, VALIDATION_ERROR);
```

should be able to be chained.

```js
var app = StreamingMiddleware();
expect(function(){
    app
        .use(NoopStreamingMiddleware)
        .use(NoopStreamingMiddleware)
        .use(NoopStreamingMiddleware)
        .use(NoopStreamingMiddleware)
        .use(NoopStreamingMiddleware)
        .use(NoopStreamingMiddleware)
}).to.not.throw();
expect(app._stack.length).to.equal(6);
```

<a name="streamingmiddleware-stream"></a>
## #stream()
should exist.

```js
var app = StreamingMiddleware();
expect(app).to.respondTo("stream");
```

should return a Readable and Writable stream.

```js
var middleware = StreamingMiddleware();
var stream = middleware.stream();
expect(stream).to.be.a.ReadableStream;
expect(stream).to.be.a.WritableStream;
```

should work as Passthrough stream if no middleware functions are configured.

```js
var middleware = StreamingMiddleware();
          var stream = middleware.stream();
          var dataIn = '{some: "object"}';
          const chunks = [];
          expect(middleware._stack.length).to.equal(0);
          var promise = new Promise(function (resolve, reject) {
              stream.on('data', function(chunk){
                chunks.push(chunk);
              });
              stream.on('end', function(){
                resolve(Buffer.concat(chunks).toString());
              });
              stream.push(dataIn);
              stream.push(null);
          });
          return promise.then(function(result){
            expect(result).to.equal(dataIn);
          })
```

should return a pipe of all the streamable middleware functions.

```js
var middleware = StreamingMiddleware();
          var dataIn = {count: 0};
          var options = {objectMode: true};
          middleware.use(function(chunk, enc, next){
            //console.log("first middleware received a chunk: ",chunk);
            var obj = chunk;
            obj.count++;
            next(null, obj); // instead of this.push
          });
          middleware.use(function(chunk, enc, next){
            //console.log("second middleware received a chunk: ",chunk);
            var obj = chunk;
            obj.count++;
            next(null, obj); // instead of this.push
          });
          var stream = middleware.stream(options);
          stream.pipe(TransformStreamWrapper(options, function(chunk,enc,next){
            expect(chunk.count).to.equal(2);
            done();
          }));
          stream.write(dataIn);
```

should process in the correct order.

```js
var middleware = StreamingMiddleware();
            var dataIn = "abcdef";
            var dataOut = "";
            middleware
                .use(function(chunk, enc, next){
                    next(null, chunk+"ghijkl");
                })
                .use(function(chunk, enc, next){
                    next(null, chunk+"mnopqr");
                })
                .use(function(chunk, enc, next){
                    next(null, chunk+"stuvwxyz");
                });
            var stream = middleware.stream();
            stream
                .on("readable",function(){
                    var data = stream.read();
                    if(data) dataOut += data;
                })
                .on("finish", function(){
                    expect(dataOut).to.equal("abcdefghijklmnopqrstuvwxyz");
                    done();
                })
            stream.end(dataIn);
```

<a name="transformstreamwrapper"></a>
# TransformStreamWrapper
should exist.

```js
expect(TransformStreamWrapper).to.not.be.undefined;
```

should be a function.

```js
expect(TransformStreamWrapper).to.be.a('function');
```

should be constructed with or without the new operator.

```js
var withNewOperator = new TransformStreamWrapper({},function(){});
expect(withNewOperator).to.be.an.instanceOf(TransformStreamWrapper);
var withoutNewOperator = TransformStreamWrapper({},function(){});
expect(withoutNewOperator).to.be.an.instanceOf(TransformStreamWrapper);
```

should bind its context to the callback function.

```js
var stream = new TransformStreamWrapper(function(chunk,enc,next){
  expect(this).to.eql(stream);
  done();
});
PassStream.pipe(stream);
PassStream.end(new Buffer('test data'));
```

should return a PassThrough stream if only options or nothing passed.

```js
var stream = new TransformStreamWrapper();
expect(stream).to.be.an.instanceOf(PassThrough);
var stream2 = new TransformStreamWrapper({objectMode: true});
expect(stream).to.be.an.instanceOf(Transform);
```

should return a Transform stream if a function is passed as first or second argument.

```js
var stream = new TransformStreamWrapper(function(chunk,enc,next){});
expect(stream).to.be.an.instanceOf(TransformStreamWrapper);
```

should pipe correctly.

```js
var stream1 = new TransformStreamWrapper(function Upper(chunk,enc,next){
      next(null, chunk.toString().toUpperCase());
    });
    var stream2 = new TransformStreamWrapper(function Reverse(chunk,enc,next){
      next(null, chunk.toString().split("").reverse().join(""));
    });
    PassStream
    .pipe(stream1)
    .pipe(stream2)
    .pipe(MemStream)
    .on('finish', function() {
      expect(MemStream.toString()).to.eql('ATAD TSET');
      done();
    });
    PassStream.end(new Buffer('test data'));
```

<a name="validation"></a>
# Validation
<a name="validation-validstack"></a>
## ValidStack
should exist.

```js
expect(ValidStack).to.not.be.undefined;
```

should be a function.

```js
expect(ValidStack).to.be.a('function');
```

should throw error if stack is invalid.

```js
// Bad stack signatures
      expect(function(){ValidStack()}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack(null)}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack(undefined)}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack("undefined")}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack("random_string")}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack({})}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack([])}).to.throw(Error, VALIDATION_ERROR);
      // Bad function signatures
      expect(function(){ValidStack([function(){}])}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack([function(one,two){}])}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack([function(onw,two,three,four){}])}).to.throw(Error, VALIDATION_ERROR);
```

<a name="validation-validtransform"></a>
## ValidTransform
should exist.

```js
expect(ValidTransform).to.not.be.undefined;
```

should be a function.

```js
expect(ValidTransform).to.be.a('function');
```

should throw error if function is invalid.

```js
// Bad function signatures
      expect(function(){ValidTransform(function(){})}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack(function(one,two){})}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack(function(one,two,three,four){})}).to.throw(Error, VALIDATION_ERROR);
```

