'use strict';
var chai = require('chai');
var chaiStream = require('chai-stream');
chai.use(chaiStream);
var expect = chai.expect;
var Util = require('util');
var through = require("through2");

function NoopStreamingMiddleware(chunk, enc, next){
  this.push(chunk);
  callback();
};

describe('StreamingMiddleware', function() {

    it('should exist', function() {
        var StreamingMiddleware = require('../streaming-middleware.js');
        expect(StreamingMiddleware).to.not.be.undefined;
    });

    it('should be a function', function() {
        var StreamingMiddleware = require('../streaming-middleware.js');
        expect(StreamingMiddleware).to.be.a('function');
    });

    it('should be able to be used with new operator', function() {
        var StreamingMiddleware = require('../streaming-middleware.js');
        var withNewOperator = new StreamingMiddleware();
        expect(withNewOperator).to.be.an.instanceOf(StreamingMiddleware);
    });

    it('should have an internal _stack property which is initially empty', function() {
        var middleware = require('../streaming-middleware.js')();
        expect(middleware).to.have.property("_stack");
        var expected = 0;
        var actual = middleware._stack.length;
        expect(actual).to.equal(expected);
    });

    describe('#use()', function() {

      it('should exist', function() {
          var app = require('../streaming-middleware.js')();
          expect(app).to.respondTo("use");
      });

      it('should only allow a function with 3 arguments or throw an error', function() {
          var app = require('../streaming-middleware.js')();
          var ErrorText = /StreamingMiddleware.use takes a function with the signature \(chunk,encoding,next\)/;

          expect(function(){app.use(NoopStreamingMiddleware)}).to.not.throw();

          expect(function(){app.use(function(){})}).to.throw(Error, ErrorText);
          expect(function(){app.use(function(one,two){})}).to.throw(Error, ErrorText);
          expect(function(){app.use(function(onw,two,three,four){})}).to.throw(Error, ErrorText);

      });

    });

    describe('#stream()', function() {

      it('should exist', function() {
          var app = require('../streaming-middleware.js')();
          expect(app).to.respondTo("stream");
      });

      it('should return a Readable and Writable stream', function() {
          var middleware = require('../streaming-middleware.js')();
          var stream = middleware.stream();
          expect(stream).to.be.a.ReadableStream;
          expect(stream).to.be.a.WritableStream;
      });

      it('should work as Passthrough stream if no middleware functions are configured', function() {

          var middleware = require('../streaming-middleware.js')();
          var stream = middleware.stream();
          var dataIn = '{some: "object"}';
          const chunks = [];

          expect(middleware._stack.length).to.equal(0);

          var promise = new Promise(function (resolve, reject) {
              stream.on('data', function(chunk){
                chunks.push(chunk);
              });
              stream.on('end', function(){
                resolve(Buffer.concat(chunks).toString());
              });

              stream.push(dataIn);
              stream.push(null);
          });

          return promise.then(function(result){
            expect(result).to.equal(dataIn);
          })

      });

      it('should return a pipe of all the streamable middleware functions', function(done) {

          var middleware = require('../streaming-middleware.js')();
          var dataIn = {count: 0};
          var options = {objectMode: true};

          middleware.use(function(chunk, enc, next){
            //console.log("first middleware received a chunk: ",chunk);
            var obj = chunk;
            obj.count++;
            next(null, obj); // instead of this.push
          })
          middleware.use(function(chunk, enc, next){
            //console.log("second middleware received a chunk: ",chunk);
            var obj = chunk;
            obj.count++;
            next(null, obj); // instead of this.push
          })

          var stream = middleware.stream(options);
          stream.pipe(through(options, function(chunk,enc,next){
            //console.log("final pipe received a chunk: ",chunk);
            expect(chunk.count).to.equal(2);
            done();
          }));
          stream.write(dataIn);

      });

    });

});
