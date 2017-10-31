var program = require('commander');
var path = require("path");
var StreamingMiddleware = require("../StreamingMiddleware.js");
var app = StreamingMiddleware();
var ReadableSearch = require('elasticsearch-streams').ReadableSearch;
var client = new require('elasticsearch').Client({
  //log : "debug",
  host: {
    protocol: 'http',
    host: 'localhost',
    port: 32769,
    path: '/'
  }
});

function addMiddlewareToStack(middleware, collection) {
  middleware = middleware.replace('$','chunk');
  var func = Function("chunk","enc","next","next(null," + middleware + ")");
  app.use(func);
}

program
  .version('0.0.1')
  .option('-f, --function [function]', 'apply function to stream', addMiddlewareToStack, [])
  .parse(process.argv);

var searchExec = function searchExec(from, callback) {
  client.search({
    index: 'test',
    from: from,
    size: 12,
    body: {
      query: { match_all: {} }
    }
  }, callback);
};

var rs = new ReadableSearch(searchExec);
rs.pipe(app.stream({objectMode: true})).pipe(process.stdout);
