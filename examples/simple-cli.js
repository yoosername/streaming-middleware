var program = require('commander');
var path = require("path");
var StreamingMiddleware = require("../StreamingMiddleware.js");
var app = StreamingMiddleware();

function addMiddlewareToStack(middleware) {
  "use strict";
  app.use(path.resolve(__dirname, middleware));
}

program
  .version('0.0.1')
  .option('-p, --plugin [plugin]', 'Add plugin to middleware chain', addMiddlewareToStack, [])
  .parse(process.argv);

process.stdin.pipe(app.stream()).pipe(process.stdout);
