var GetFunctionArguments = require('./lib/argument-util.js').GetFunctionArguments;
var MiddlewareChainedStream = require('./lib/MiddlewareChainedStream.js');
var stream = require('stream');
var Transform = stream.Transform;

function StreamingMiddleware(){
  if(!(this instanceof StreamingMiddleware)){
    return new StreamingMiddleware();
  }
  this._stack = [];
}

StreamingMiddleware.prototype.use = function(fn){

  if(arguments.length > 1 || !fn || fn === 'undefined' || typeof(fn) != "function"){
    throw new Error("StreamingMiddleware.use takes a single function with the signature (chunk,encoding,next)");
  }

  var functionArgs = GetFunctionArguments(fn);
  if(functionArgs.length < 3 || functionArgs.length > 3 ){
    throw new Error("StreamingMiddleware.use takes a function with the signature (chunk,encoding,next)");
  }

  this._stack.push(fn);

}

StreamingMiddleware.prototype.stream = function(options){

  if( this._stack.length === 0 ){
    return new stream.PassThrough();
  }

  return new MiddlewareChainedStream(options, this._stack);

}

StreamingMiddleware.prototype._getStreamableMiddleware = function(){
  return this._stack.filter(function(fn){
    return ((new fn()) instanceof Transform);
  });
}

module.exports = StreamingMiddleware;
