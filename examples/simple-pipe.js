var StreamingMiddleware = require("../lib/StreamingMiddleware.js");
var app = StreamingMiddleware();

app
  .use(function Uppercase(chunk, enc, next){
    "use strict";
    next(null, chunk.toString().toUpperCase() );
  })
  .use(function Uppercase(chunk, enc, next){
    "use strict";
    next(null, chunk.toString().split("").reverse().join("").trim("") + "\n" );
  });

process.stdin.pipe(app.stream()).pipe(process.stdout);
