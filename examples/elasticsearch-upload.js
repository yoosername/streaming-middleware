const cli = require('commander');
const path = require("path");
const WritableBulk = require('elasticsearch-streams').WritableBulk;
const random = require('random-document-stream');
var app = require("../lib/StreamingMiddleware.js")();

function addMiddlewareToStack(middleware) {
  "use strict";
  app.use(path.resolve(__dirname, middleware));
}

cli
  .version('0.0.1')
  .option('-a, --amount <amount>', "Amount of random records to stream in")
  .option('-h --host <host>', "Elasticsearch host")
  .option('-p --port <port>', "Elasticsearch port")
  .option('-i --index <index>', "Elasticsearch index")
  .option('-t, --transform <transform>', 'Add data transformer', addMiddlewareToStack, [])
  .parse(process.argv);

if(!cli.amount || !cli.host || !cli.port || !cli.index){
  return cli.help();
}

const client = new require('elasticsearch').Client({
  log : "debug",
  host: {
    protocol: 'http',
    host: cli.host,
    port: cli.port,
    path: '/'
  }
});

const ws = new WritableBulk(function(bulkCmds, callback) {
  "use strict";
  client.bulk({
    index : cli.index,
    type  : 'test',
    body  : bulkCmds
  }, callback);
});

random(cli.amount)
  .pipe(app.stream({objectMode:true}))
  .pipe(ws);