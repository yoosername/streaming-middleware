const Util = require("util");
const {Duplex, PassThrough, Transform} = require("stream");
const {ValidStack, ValidTransform} = require("./Validation.js");
const TransformStreamWrapper = require("./TransformStreamWrapper.js");

const ERROR_ADDING_STREAM_TO_STACK = "Error adding stream to stack";

/**
 * Create a Duplex Stream from a chain of multiple Transform streams
 * @private
 * @constructor
 * @param {Object} opts - custom stream options e.g. {objectMode: true}
 * @param {Array} stk - Array of {Function}s making up the overall transform stream
 * @return {MiddlewareChainedStream}
 */
function MiddlewareChainedStream(options, stack){
  "use strict";

  if(!(this instanceof MiddlewareChainedStream)){
    return new MiddlewareChainedStream(options, stack);
  }

  if (options instanceof Array) {
    stack     = options;
    options   = {};
  }

  if( !stack || stack === "undefined" || stack.length === 0 ){
    return new PassThrough(options);
  }

  if( ValidStack(stack) ){
    this.stack = BuildStreamStack(options, stack);
    this.first = this.stack[0];
    this.last = this.stack[this.stack.length-1];
    this.isHookedUp = false;
    Duplex.call(this, options);

    // If we have an error, just call the callback
    this
    .on("error", function(cb){
      cb();
    });
  }

}

/*
  WRITABLE Methods ( triggered as a result of things writing to us )
*/
// Inbound stream. write it directly to the first middleware in the stack;
MiddlewareChainedStream.prototype._write = function (chunk, enc, cb) {
  "use strict";
  this.first.write(chunk, enc, cb);
};

// Inbound stream. pipe it straight to the first middleware in the stack;
//MiddlewareChainedStream.prototype._flush = function (cb) {
//  this.first.flush(cb);
//};

// The thing writing to us has called for us to end.
// Before we do lets let the middleware finish first
MiddlewareChainedStream.prototype._final = function (cb) {
  "use strict";
  // make the last middlewares final handler call the callback to call finish
  // so we actually finish once the last middleware is finished
  this.last._final = cb;
  // now trigger end on the first first middleware to propagate the finish
  this.first.end();
};

/*
  READABLE Methods ( triggered as a result of things reading from us )
*/
// Outbound stream (Sink). Hook it up to listen for data from last middleware in stack
MiddlewareChainedStream.prototype._read = function () {
  "use strict";

  var self = this;

  if(!this.isHookedUp){

    // Only need to set this up the once
    this.last
      .on("data", function (data) {
        // When last middleware has data to push, push it straight to sink
        self.push(data);
      })
      .on("finish", function () {
        // push the EOF null chunk to end the Readable stream.
        self.push(null);
      });

    this.isHookedUp = true;
  }

};

Util.inherits(MiddlewareChainedStream, Duplex);

function BuildStreamStack(options, stack){
  "use strict";

  var newStack = [];

  stack.forEach(function(fn){

    var currentStream;

    // If instance of TransformStream we can just add it
    // otherwise need to wrap it first
    if( fn instanceof Transform ){
      currentStream = fn;
    }else{
      currentStream = TransformStreamWrapper(options, fn);
    }

    if(currentStream){

      // If we have any previous middleware to chain the pipe from
      if( newStack.length > 0 ){
        // then pipe it
        var prevStream = newStack[newStack.length-1];
        if(prevStream.pipe){
          prevStream.pipe(currentStream);
        }
      }

      // and add it to the stack
      newStack.push(currentStream);

    }else{
      throw new Error(ERROR_ADDING_STREAM_TO_STACK);
    }

  });

  return newStack;

}

module.exports = MiddlewareChainedStream;
