var program = require('commander');
var path = require("path");
var WritableBulk = require('elasticsearch-streams').WritableBulk;
var random = require('random-document-stream');
var client = new require('elasticsearch').Client({
  //log: "debug",
  host: {
    protocol: 'http',
    host: 'localhost',
    port: 32769,
    path: '/'
  }});
var StreamingMiddleware = require("../StreamingMiddleware.js");
var app = StreamingMiddleware();

function addMiddlewareToStack(middleware, collection) {
  app.use(path.resolve(__dirname, middleware));
}

program
  .version('0.0.1')
  .option('-p, --plugin [plugin]', 'Add plugin to middleware chain', addMiddlewareToStack, [])
  .parse(process.argv);

var ws = new WritableBulk(function(bulkCmds, callback) {
  console.log("gets here");
  client.bulk({
    index : 'test',
    type  : 'test',
    body  : bulkCmds
  }, callback);
});

random(100)
  .pipe(app.stream({objectMode:true}))
  .pipe(ws)
