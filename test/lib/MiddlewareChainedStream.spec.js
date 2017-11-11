'use strict';
var chai = require('chai');
var sinon = require("sinon");
var chaiStream = require('chai-stream');
var sinonChai = require('sinon-chai');
chai.use(chaiStream);
chai.use(sinonChai);
var expect = chai.expect;
var stream = require("stream");
var PassThrough = stream.PassThrough;
var MemoryStream = require('memorystream');


function NoopStreamingMiddleware(chunk, enc, next){
  this.push(chunk);
  callback();
};

describe('MiddlewareChainedStream', function() {

    var MiddlewareChainedStream = null;
    var readStream = null;
    var memStream = null;
    var passStream = null;

    beforeEach(function(){
      MiddlewareChainedStream = require('../../lib/MiddlewareChainedStream.js');
      passStream = new stream.PassThrough();
      memStream = new MemoryStream.createWriteStream();
    });

    afterEach(function(){
      MiddlewareChainedStream = null;
      readStream = null;
      memStream = null;
      passStream = null;
    });

    it('should exist', function() {
        expect(MiddlewareChainedStream).to.not.be.undefined;
    });

    it('should be a function', function() {
        expect(MiddlewareChainedStream).to.be.a('function');
    });

    it('should be able to be used with or without new operator', function() {
        var withNewOperator = new MiddlewareChainedStream();
        expect(withNewOperator).to.be.an.instanceOf(PassThrough);
        expect(withNewOperator).to.be.a.ReadableStream;
        expect(withNewOperator).to.be.a.WritableStream;

        var withoutNewOperator = MiddlewareChainedStream();
        expect(withoutNewOperator).to.be.an.instanceOf(PassThrough);
        expect(withoutNewOperator).to.be.a.ReadableStream;
        expect(withoutNewOperator).to.be.a.WritableStream;
    });

    it('should work with or without optional options argument', function() {

        var withoutOptionsNoStack = new MiddlewareChainedStream();
        expect(withoutOptionsNoStack).to.be.an.instanceOf(PassThrough);

        var ErrorText = "Stack validation failed: transform functions must have signature (chunk,enc,next)";
        expect(function(){MiddlewareChainedStream([{}]);}).to.throw(Error, ErrorText);

        var withoutOptionsStack = new MiddlewareChainedStream([NoopStreamingMiddleware]);
        expect(withoutOptionsStack).to.be.an.instanceOf(MiddlewareChainedStream);

        var withOptionsStack = new MiddlewareChainedStream({},[NoopStreamingMiddleware]);
        expect(withOptionsStack).to.be.an.instanceOf(MiddlewareChainedStream);

    });

    it('should return a PassthroughStream if stack is empty', function() {
        var withNewOperator = new MiddlewareChainedStream({},[]);
        expect(withNewOperator).to.be.an.instanceOf(PassThrough);
    });

    it('should pipe data correctly as a Passthrough', function(done) {
        var stream = new MiddlewareChainedStream();

        passStream
        .pipe(stream)
        .pipe(memStream)
        .on('finish', function() {
          expect(memStream.toString()).to.eql('test data');
          done();
        });

        passStream.end(new Buffer('test data'));

    });

    it('should pipe data correctly with middleware', function(done) {

        var stream = new MiddlewareChainedStream([
          function(chunk,enc,next){
            next(null, chunk.toString().split("").reverse().join(""));
          },
          function(chunk,enc,next){
            next(null, chunk.toString().toUpperCase());
          },
        ]);

        passStream
        .pipe(stream)
        .pipe(memStream)
        .on('finish', function() {
          expect(memStream.toString()).to.eql('ATAD TSET');
          done();
        });

        passStream.end(new Buffer('test data'));

    });

    it('should emit Writable finish event correctly', function(done) {

        var stream = new MiddlewareChainedStream([
          function(chunk,enc,next){
            next(null, chunk.toString().split("").reverse().join(""));
          },
          function(chunk,enc,next){
            next(null, chunk.toString().toUpperCase());
          },
        ]);

        var spy = sinon.spy(stream, "_final");

        stream
        .on('finish', function() {
          expect(spy.called).to.be.true;
          done();
        })
        .on('data', function() {
          //for some reason there has to be a data handler configured or finish event nevers gets called
        });

        for (let i = 0; i < 11; i++) {
          stream.write(`${i}`);
        }

        stream.end();

    });

    it('should emit _final event correctly upon end() before finish event', function(done) {

        var stream = new MiddlewareChainedStream([
          function(chunk,enc,next){
            next(null, chunk.toString().split("").reverse().join(""));
          },
          function(chunk,enc,next){
            next(null, chunk.toString().toUpperCase());
          },
        ]);

        var spy = sinon.spy(stream, "_final");

        stream
        .on('finish', function() {
          expect(spy.calledOnce).to.be.true;
          done();
        })

        for (let i = 0; i < 11; i++) {
          stream.write(`${i}`);
        }

        stream.end();

    });

    it('should emit data event correctly', function(done) {

        var stream = new MiddlewareChainedStream([
          function(chunk,enc,next){
            next(null, chunk.toString().split("").reverse().join(""));
          },
          function(chunk,enc,next){
            next(null, chunk.toString().toUpperCase());
          },
        ]);

        var input = ["some","input","data"];
        var result = "";

        stream
        .on('data', function(chunk) {
          result += chunk.toString();
        })
        .on('finish', function() {
          expect(result).to.equal("EMOSTUPNIATAD");
          done();
        })

        input.forEach(function(str){
          stream.write(str);
        });

        stream.end();

    });

    it('should emit readable event when end of stream reached', function(done) {

        var stream = new MiddlewareChainedStream([
          function(chunk,enc,next){
            next(null, chunk.toString().split("").reverse().join(""));
          },
          function(chunk,enc,next){
            next(null, chunk.toString().toUpperCase());
          },
        ]);

        var input = ["some","input","data"];
        var result = "";

        stream
        .on('readable', function() {
          // read a chunk
          var read = stream.read();

          // if our result already matches the expected string then result should be null
          // which indicates end of the stream has been reached.
          if(result === "EMOSTUPNIATAD"){
            expect(read).to.equal(null);
            done();
          }

          // otherwise just increment the result
          result += read.toString();

        })

        input.forEach(function(str){
          stream.write(str);
        });

        stream.end();

    });

});
