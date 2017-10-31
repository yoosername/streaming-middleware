var Util = require('util');
var stream = require('stream');
var Duplex = stream.Duplex;
var PassThrough = stream.PassThrough;
var through = require("through2");
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

    // When we are not being written to anymore call end on the first middleware to propogate
    this.on("finish", function(){
      this.first.end(null);
    }.bind(this))

  }else{

    return new PassThrough(options);

  }



}

// Inbound stream. pipe it straight to the first stream in the stack;
MiddlewareChainedStream.prototype._write = function (chunk, enc, cb) {
  //console.log("i have been written to");
  this.first.write(chunk, enc, cb);
};

MiddlewareChainedStream.prototype._read = function (n) {
  var self = this;
  if(!this.isHookedUp){
    // Only need to set this up the once
    this.last
      .on('data', function (data) {
        self.push(data);
      })
      .on('end', function () {
        self.push(null); // EOF
      })
      this.isHookedUp = true;
  }
};

Util.inherits(MiddlewareChainedStream, Duplex);

function BuildStreamStack(options, stack){

  var newStack = [];

  stack.forEach(function(fn){
    var currentStream = through(options, fn);
    if(newStack.length>0 && newStack[newStack.length-1].pipe) newStack[newStack.length-1].pipe(currentStream);
    newStack.push(currentStream);
  });

  // var finalReadableStream = new PassThrough({objectMode: true});
  // lastStream.pipe(finalReadableStream);
  // newStack.push(finalReadableStream);

  return newStack;

}

module.exports = MiddlewareChainedStream;
