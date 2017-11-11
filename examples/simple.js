var StreamingMiddleware = require("../StreamingMiddleware.js");
var app = StreamingMiddleware();

app
  .use(function Uppercase(chunk, enc, next){
    next(null, chunk.toString().toUpperCase() );
  })
  .use(function Uppercase(chunk, enc, next){
    next(null, chunk.toString().split("").reverse().join("").trim("") + "\n" );
  })

process.stdin.pipe(app.stream()).pipe(process.stdout);
