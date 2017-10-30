function Uppercase(chunk, enc, next){

  next(null, chunk.toString().split("").reverse().join("").trim("") + "\n" );

}

module.exports = Uppercase;
