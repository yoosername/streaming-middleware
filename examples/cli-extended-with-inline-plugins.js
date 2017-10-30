var program = require('commander');
var path = require("path");
var StreamingMiddleware = require("../StreamingMiddleware.js");
var app = StreamingMiddleware();

function addMiddlewareToStack(middleware, collection) {
  middleware = middleware.replace('$','chunk');
  var func = Function("chunk","enc","next","next(null," + middleware + ")");
  app.use(func);
}

program
  .version('0.0.1')
  .option('-f, --function [function]', 'apply function to stream', addMiddlewareToStack, [])
  .parse(process.argv);

process.stdin.pipe(app.stream()).pipe(process.stdout);
