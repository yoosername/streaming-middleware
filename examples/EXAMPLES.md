# Examples

## Install

* Install example dependencies

```bash
npm install
```

* See Usage for for how to run individual examples

## Simple pipe from STDIN to STDOUT

```javascript
var StreamingMiddleware = require("../lib/StreamingMiddleware.js");
var app = StreamingMiddleware();

app
  .use(function Uppercase(chunk, enc, next){
    "use strict";
    next(null, chunk.toString().toUpperCase() );
  })
  .use(function Reverse(chunk, enc, next){
    "use strict";
    next(null, chunk.toString().split("").reverse().join("").trim("") + "\n" );
  });

process.stdin.pipe(app.stream()).pipe(process.stdout);
```

### Usage

```bash
echo "tiny rick" | node simple-pipe.js  # KCIR YNIT
```

## Simple CLI extended via plugins

### simple-cli.js

```javascript
var program = require('commander');
var path = require("path");
var StreamingMiddleware = require("../StreamingMiddleware.js");
var app = StreamingMiddleware();

function addMiddlewareToStack(middleware, collection) {
  app.use(path.resolve(__dirname, middleware));
}

program
  .version('0.0.1')
  .option('-p, --plugin [plugin]', 'Add plugin to middleware chain', addMiddlewareToStack, [])
  .parse(process.argv);

process.stdin.pipe(app.stream()).pipe(process.stdout);
```

### plugins/uppercase.js

```javascript
function Uppercase(chunk, enc, next){

  next(null, chunk.toString().toUpperCase() );

}

module.exports = Uppercase;
```

### plugins/reverse.js

```javascript
function Uppercase(chunk, enc, next){

  next(null, chunk.toString().split("").reverse().join("").trim("") + "\n" );

}

module.exports = Uppercase;
```

### Usage

```bash
echo "pickle rick" | node simple-cli.js -p ./plugins/uppercase.js -p ./plugins/reverse.js  # KCIR ELKCIP
```

## Pipe random documents into Elasticsearch

### elasticsearch-upload.js

```javascript
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
```

### plugins/transform-to-bulk.js

```javascript
function TransformToBulk(doc, enc, next){
  "use strict";

  var docId = doc._id;
  doc._id = undefined;
  this.push({ index: { _id: docId } });
  this.push(doc);
  next();

}

module.exports = TransformToBulk;
```

### Usage

```bash
node ./elasticsearch-upload.js -a 5 -h localhost -p 32769 -i test -t ./plugins/transform-to-bulk.js
```

## Pipe search stream from Elasticsearch

### elasticsearch-search.js

```javascript
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
```

### Usage

```bash
node ./elasticsearch-search-stream-example.js -h localhost -p 32769 -i test -f '$._source.name.toString() + "\n"'
```