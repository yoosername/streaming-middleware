const GetFunctionArguments = require('./GetFunctionArguments.js');
const MiddlewareChainedStream = require('./MiddlewareChainedStream.js');
const {ValidStack, ValidTransform} = require("./Validation.js");
const {Transform, PassThrough} = require('stream');

/**
 * Transform stream middleware builder
 * @public
 * @constructor
 * @return {StreamingMiddleware}
 */
function StreamingMiddleware(){
  if(!(this instanceof StreamingMiddleware)){
    return new StreamingMiddleware();
  }
  this._stack = [];
}

/**
 * Add a single Transform middleware function to the stack
 *  - can be chained for ease of use
 * @public
 * @param {Function} fn An instanceof {Transform} or a plain Function with 3 args
 * @return {StreamingMiddleware}
 */
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

/**
 * Return a Duplex stream where you write to the first Transform middleware and read from the last
 *   - can be chained for ease of use
 * @public
 * @param {Object} options optional stream object e.g. {objectMode:true}
 * @return {DuplexStream}
 */
StreamingMiddleware.prototype.stream = function(options){

  if( this._stack.length === 0 ){
    return new PassThrough(options);
  }

  return new MiddlewareChainedStream(options, this._stack);

}

module.exports = StreamingMiddleware;
