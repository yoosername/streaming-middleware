var GetFunctionArguments = require('./lib/argument-util.js').GetFunctionArguments;
var MiddlewareTransformStream = require('./lib/MiddlewareTransformStream.js');
var Transform = require('stream').Transform;

function StreamingMiddleware(context){
  if(!(this instanceof StreamingMiddleware)){
    return new StreamingMiddleware(context);
  }

  this._stack = [];
  this._errorStack = [];
  this._context = context;
  this._stream = new MiddlewareTransformStream();

}

StreamingMiddleware.prototype.use = function(fn){

  if(arguments.length < 1 || arguments.length > 1 || !fn || fn === 'undefined'){
    throw new Error("StreamingMiddleware.use takes a single argument");
  }

  var functionArgs = GetFunctionArguments(fn);
  if(typeof(fn) === "function" && (functionArgs.length < 2 || functionArgs.length > 3 )){
    throw new Error("StreamingMiddleware.use takes a single function with the signature ([Error],ctx,next)");
  }

  if(functionArgs.length === 2){

    this._stack.push(fn);

  }else if (functionArgs.length === 3) {

    this._errorStack.push(fn);

  }

}

StreamingMiddleware.prototype.stream = function(){
  return this._stream;
}

StreamingMiddleware.prototype._getStreamableMiddleware = function(){
  return this._stack.filter(function(fn){
    return ((new fn()) instanceof Transform);
  });
}

module.exports = StreamingMiddleware;
