function Uppercase(chunk, enc, next){

  next(null, chunk.toString().toUpperCase() );

}

module.exports = Uppercase;
