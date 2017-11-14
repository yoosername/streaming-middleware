function Uppercase(chunk, enc, next){
  "use strict";
  
  next(null, chunk.toString().toUpperCase() );

}

module.exports = Uppercase;
