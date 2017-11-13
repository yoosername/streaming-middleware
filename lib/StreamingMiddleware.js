const GetFunctionArguments = require('./GetFunctionArguments.js');
const MiddlewareChainedStream = require('./MiddlewareChainedStream.js');
const {ValidStack, ValidTransform} = require("./Validation.js");
const {Transform, PassThrough} = require('stream');

function StreamingMiddleware(){
  if(!(this instanceof StreamingMiddleware)){
    return new StreamingMiddleware();
  }
  this._stack = [];
}

StreamingMiddleware.prototype.use = function(fn){

  // If its a string try and load it as a module
  if(typeof(fn) === "string"){
    try{
      fn = require(fn);
    }catch(e){}
  }

  // Now validate the function
  this.isValid = ValidTransform(fn)

  // add valid function to stack
  this._stack.push(fn);

  // and return this for chaining
  return this;

}

StreamingMiddleware.prototype.stream = function(options){

  if( this._stack.length === 0 ){
    return new PassThrough(options);
  }

  return new MiddlewareChainedStream(options, this._stack);

}

module.exports = StreamingMiddleware;
