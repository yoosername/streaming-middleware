var GetFunctionArguments = require('./GetFunctionArguments.js');
var MiddlewareChainedStream = require('./MiddlewareChainedStream.js');
var expand = require("expand-tilde");
var stream = require('stream');
var Transform = stream.Transform;

function StreamingMiddleware(){
  if(!(this instanceof StreamingMiddleware)){
    return new StreamingMiddleware();
  }
  this._stack = [];
}

StreamingMiddleware.prototype.use = function(fn){

  var origFn = fn;

  if(arguments.length > 1 || !fn || fn === 'undefined' || typeof(fn) != "function"){

    if(typeof(fn) === "string"){
      try{
        //console.log(fn);
        fn = require(expand(fn));
      }catch(e){
        //console.log(e);
        throw new Error("StreamingMiddleware.use was called with a String but could not load the module ("+origFn.toString()+"): ");
      }
    }else{
      throw new Error("StreamingMiddleware.use takes a single function with the signature (chunk,encoding,next)");
    }

  }

  var functionArgs = GetFunctionArguments(fn);
  if(functionArgs.length < 3 || functionArgs.length > 3 ){
    throw new Error("StreamingMiddleware.use takes a function with the signature (chunk,encoding,next)");
  }

  this._stack.push(fn);

  // for chaining
  return this;

}

StreamingMiddleware.prototype.stream = function(options){

  if( this._stack.length === 0 ){
    return new stream.PassThrough(options);
  }

  return new MiddlewareChainedStream(options, this._stack);

}

StreamingMiddleware.prototype._getStreamableMiddleware = function(){
  return this._stack.filter(function(fn){
    var func = null;
    try{func = new fn()}
    catch(e){};
    return (func instanceof Transform);
  });
}

module.exports = StreamingMiddleware;
