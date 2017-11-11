var Util = require('util');
var stream = require('stream');
var Duplex = stream.Duplex;
var PassThrough = stream.PassThrough;
var through2 = require("through2");
var ValidateStack = require("../lib/ValidateStack.js")

function MiddlewareChainedStream(opts, stk){

  var stack = (arguments.length === 2) ? arguments[1] : arguments[0];
  var options = (arguments.length === 2) ? arguments[0] : {};

  if(!(this instanceof MiddlewareChainedStream)){
    return new MiddlewareChainedStream(options, stack);
  };

  if(stack && stack != "undefined" && stack.length && stack.length > 0){

    ValidateStack(stack);

    this.stack = BuildStreamStack(options, stack);
    this.first = this.stack[0];
    this.last = this.stack[this.stack.length-1];
    this.isHookedUp = false;
    Duplex.call(this, options);

  }else{

    return new PassThrough(options);

  }



}

// Inbound stream. pipe it straight to the first middleware in the stack;
MiddlewareChainedStream.prototype._write = function (chunk, enc, cb) {
  this.first.write(chunk, enc, cb);
};

// The thing writing to us has called for us to end.
// Before we do lets let the middleware finish first
MiddlewareChainedStream.prototype._final = function (cb) {
  this.first.end();
  // store the callback for when the last middleware is finished
  this.writableFinalCallback = cb;
};

// Outbound stream (Sink). Hook it up to listen for data from last middleware in stack
MiddlewareChainedStream.prototype._read = function (n) {

  var self = this;

  if(!this.isHookedUp){
    // Only need to set this up the once
    this.last
      .on('data', function (data) {
        // When last middleware has data to push, push it straight to sink
        self.push(data);
      })
      .on('finish', function () {
        // finish event on last middleware captured

        // push the EOF null chunk to end the Readable stream.
        self.push(null);

        // If there was a callback required for the writable stream call it
        if( self.writableFinalCallback ){
          self.writableFinalCallback();
        }

      })

    this.isHookedUp = true;
  }

};

Util.inherits(MiddlewareChainedStream, Duplex);

function BuildStreamStack(options, stack){

  var newStack = [];

  stack.forEach(function(fn){
    // TODO: Remove the need for Through2
    var currentStream = through2(options, fn);
    if(newStack.length>0){
      // We have some previous middleware to pipe from Now
      var prevStream = newStack[newStack.length-1];
      if(prevStream.pipe) prevStream.pipe(currentStream);
    }
    newStack.push(currentStream);
  });

  return newStack;

}

module.exports = MiddlewareChainedStream;
