const cli = require('commander');
const StreamingMiddleware = require("../lib/StreamingMiddleware.js");
const app = StreamingMiddleware();
const ReadableSearch = require('elasticsearch-streams').ReadableSearch;

function addMiddlewareToStack(middleware) {
  "use strict";
  middleware = middleware.replace('$','chunk');
  var func = Function("chunk","enc","next","next(null," + middleware + ")");
  app.use(func);
}

cli
  .version('0.0.1')
  .option('-h --host <host>', "Elasticsearch host")
  .option('-p --port <port>', "Elasticsearch port")
  .option('-i --index <index>', "Elasticsearch index")
  .option('-f, --function [function]', 'apply function to stream', addMiddlewareToStack, [])
  .parse(process.argv);

if(!cli.host || !cli.port || !cli.index){
  return cli.help();
}

const client = new require('elasticsearch').Client({
  //log : "debug",
  host: {
    protocol: 'http',
    host: cli.host,
    port: cli.port,
    path: '/'
  }
});

const searchExec = function searchExec(from, callback) {
  "use strict";

  client.search({
    index: cli.index,
    from: from,
    size: 12,
    body: {
      query: { match_all: {} }
    }
  }, callback);
};

var rs = new ReadableSearch(searchExec);

rs.pipe(app.stream({objectMode: true})).pipe(process.stdout);
