var Util = require('util');
var Transform = require('stream').Transform;

function MiddlewareTransformStream(){
  if(!(this instanceof MiddlewareTransformStream)){
    return new MiddlewareTransformStream();
  }
  var objectMode = (context && context.objectMode) ? context.objectMode : false;
  Transform.call(this, {objectMode : objectMode});
}

MiddlewareTransformStream.prototype._transform = function _transform(input, encoding, callback) {
  this.push({when: Date.now(), input: JSON.parse(input)});
  callback();
};

Util.inherits(MiddlewareTransformStream, Transform);

module.exports = MiddlewareTransformStream;
