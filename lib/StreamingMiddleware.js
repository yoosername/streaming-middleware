const MiddlewareChainedStream = require("./MiddlewareChainedStream.js");
const {ValidTransform} = require("./Validation.js");
const {PassThrough} = require("stream");

/**
 * Transform stream builder
 * @public
 * @constructor
 */
function StreamingMiddleware() {
  "use strict";

  if (!(this instanceof StreamingMiddleware)) {
    return new StreamingMiddleware();
  }
  this._stack = [];
}

/**
 * Add a Transform Function to the stack
 * @public
 * @param {Function} fn An instanceof {Transform} or a plain Function with 3 args
 * @return {StreamingMiddleware}
 * 
 * @example Simple use
 * 
 *  var app = StreamingMiddleware();
 *  app.use(function Uppercase(chunk, enc, next){
 *    next(null, chunk.toString().toUpperCase() );
 *  })
 * 
 * @example Chaining
 * 
 *  var app = StreamingMiddleware();
 *  app
 *    .use(function Uppercase(chunk, enc, next){
 *      next(null, chunk.toString().toUpperCase() );
 *    })
 *    .use(function Reverse(chunk, enc, next){
 *      next(null, chunk.toString().split("").reverse().join("").trim("") + "\n" );
 *    })
 * 
 */
StreamingMiddleware.prototype.use = function (fn) {
  "use strict";

  // If fn is a string assume its a module and try to load it
  if (typeof (fn) === "string") {
    try {
      fn = require(fn);
    } catch (e) {}
  }

  // Now validate the function
  this.isValid = ValidTransform(fn)

  // and if valid add it to the stack
  this._stack.push(fn);

  // finally return (this) for chaining
  return this;

};

/**
 * Return a Duplex stream build by connecting all the Transform streams which were added via StreamingMiddleware.use()
 * @public
 * @param {Object} options options passed to each Transform e.g. "objectMode"
 * @return {DuplexStream}
 * @example Stream of 2 Transforms in non object mode
 * 
 *  var app = StreamingMiddleware();
 *  app
 *    .use(function Uppercase(chunk, enc, next){
 *      next(null, chunk.toString().toUpperCase() );
 *    })
 *    .use(function Uppercase(chunk, enc, next){
 *      next(null, chunk.toString().split("").reverse().join("").trim("") + "\n" );
 *    })
 *  process.stdin.pipe(app.stream()).pipe(process.stdout);
 * 
 */
StreamingMiddleware.prototype.stream = function (options) {
  "use strict";

  if (this._stack.length === 0) {
    return new PassThrough(options);
  }

  return new MiddlewareChainedStream(options, this._stack);

};

module.exports = StreamingMiddleware;