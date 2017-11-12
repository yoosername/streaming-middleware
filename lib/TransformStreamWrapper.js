const { Transform, PassThrough } = require('stream');
const util = require('util');

/**
 * create a stream.TransformStream from a standard function
 * @constructor
 * @param {Object} options - options for transform e.g. {objectMode: true}
 * @param {Function} fn - function which will handle the data
 * @return {stream.TransformStream}
 */
function TransformStreamWrapper(options, fn){

  if (!(this instanceof TransformStreamWrapper)){
    return new TransformStreamWrapper(options, fn);
  }

  if (arguments.length === 1) {
      if(typeof(options) === "function"){
        fn = options;
        options = {};
      }
  }

  if(!fn || fn === "undefined"){
    return new PassThrough(options);
  }

  Transform.call(this, options);

  this.options = options;
  this.fn = fn.bind(this);

}

util.inherits(TransformStreamWrapper, Transform);

TransformStreamWrapper.prototype._transform = function(data, encoding, callback) {
  this.fn(data, encoding, callback);
};

module.exports = TransformStreamWrapper
