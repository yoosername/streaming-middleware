'use strict';
const chai = require('chai');
const sinon = require("sinon");
const chaiStream = require('chai-stream');
const sinonChai = require('sinon-chai');
chai.use(chaiStream);
chai.use(sinonChai);
const expect = chai.expect;

const {Transform, PassThrough, Readable} = require("stream");
const MemoryStream = require('memorystream');
const MiddlewareChainedStream = require('../../lib/MiddlewareChainedStream.js');

const util = require('util');

const NoopStreamingMiddleware = function Noop(chunk, enc, next){
  this.push(chunk);
  callback();
};

const validStack = [NoopStreamingMiddleware];

const VALIDATION_ERROR = "Stack must be none null and contain only functions that inherit stream.Transform or have 3 args";

describe('MiddlewareChainedStream', function() {

    var memStream = null;
    var passStream = null;

    beforeEach(function(){
      passStream = new PassThrough();
      memStream = new MemoryStream.createWriteStream();
    });

    afterEach(function(){
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

        var withoutOptionsStack = new MiddlewareChainedStream(validStack);
        expect(withoutOptionsStack).to.be.an.instanceOf(MiddlewareChainedStream);

        var withOptionsStack = new MiddlewareChainedStream({},validStack);
        expect(withOptionsStack).to.be.an.instanceOf(MiddlewareChainedStream);

    });

    it('should throw an error if any elements in the stack are not plain function or stream.Transform', function() {

        var undef;

        // Object
        expect(function(){MiddlewareChainedStream([{}]);}).to.throw(Error, VALIDATION_ERROR);
        // Object, Function, Array
        expect(function(){MiddlewareChainedStream([{},NoopStreamingMiddleware,[]]);}).to.throw(Error, VALIDATION_ERROR);
        // Function, Function, null
        expect(function(){MiddlewareChainedStream([NoopStreamingMiddleware,NoopStreamingMiddleware,null]);}).to.throw(Error, VALIDATION_ERROR);
        // Function, Function, undefined
        expect(function(){MiddlewareChainedStream([NoopStreamingMiddleware,NoopStreamingMiddleware,undef]);}).to.throw(Error, VALIDATION_ERROR);
        // Function, undefined, Function
        expect(function(){MiddlewareChainedStream([NoopStreamingMiddleware,undef,NoopStreamingMiddleware]);}).to.throw(Error, VALIDATION_ERROR);
        // undefined
        expect(function(){MiddlewareChainedStream([undef]);}).to.throw(Error, VALIDATION_ERROR);
        // null
        expect(function(){MiddlewareChainedStream([null]);}).to.throw(Error, VALIDATION_ERROR);

    });

    it('should return a PassthroughStream if stack is empty', function() {
        var withNewOperator = new MiddlewareChainedStream({},[]);
        expect(withNewOperator).to.be.an.instanceOf(PassThrough);

        var withNewOperator = new MiddlewareChainedStream([]);
        expect(withNewOperator).to.be.an.instanceOf(PassThrough);
    });

    it('should return a MiddlewareChainedStream if stack contains plain functions with correct sig', function() {
        var stream = new MiddlewareChainedStream([
          function(chunk,enc,next){
            next(null, chunk.toString().split("").reverse().join(""));
          }
        ]);
        expect(stream).to.be.an.instanceOf(MiddlewareChainedStream);

        var stream2 = new MiddlewareChainedStream([
          function(chunk,enc,next){
            next(null, chunk.toString().split("").reverse().join(""));
          },
          function(chunk,enc,next){
            next(null, chunk.toString().toUpperCase());
          },
        ]);
        expect(stream2).to.be.an.instanceOf(MiddlewareChainedStream);
    });

    it('should return a MiddlewareChainedStream if stack contains Transform instances', function() {

        function TestTransform(options){
          Transform.call(this, options);
        }
        util.inherits(TestTransform, Transform);

        TestTransform.prototype._transform = function(data, encoding, callback) {
          callback(null, data);
        };

        var transform1 = new TestTransform();

        var stream = new MiddlewareChainedStream([transform1]);
        expect(stream).to.be.an.instanceOf(MiddlewareChainedStream);

        var transform2 = new TestTransform({objectMode: true});
        var transform3 = new TestTransform({objectMode: true});

        var stream2 = new MiddlewareChainedStream([transform2,transform3]);
        expect(stream2).to.be.an.instanceOf(MiddlewareChainedStream);

        var plainFunction = function(chunk,enc,next){};

        var stream3 = new MiddlewareChainedStream([transform2,plainFunction,transform3]);
        expect(stream3).to.be.an.instanceOf(MiddlewareChainedStream);

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

    it('should work as a regular writable stream', function(done) {
      
      var simplePassThrough = new MiddlewareChainedStream([
        function(chunk,enc,next){
          next(null, chunk);
        }
      ]);
      var result = "";

      simplePassThrough.on('readable', function(){
        var it = simplePassThrough.read();
        result += (it) ? it : "";
      });

      simplePassThrough.on('finish', function(){
        expect(result).to.equal('some datasome more datadone writing data');
        done();
      });

      simplePassThrough.write('some data');
      simplePassThrough.write('some more data');
      simplePassThrough.end('done writing data');

    });

    it("should handle unpipe event", function(done){

      const simplePassThrough = new MiddlewareChainedStream([
        function(chunk,enc,next){
          next(null, chunk);
        }
      ]);
      const reader = new Readable();
      simplePassThrough.on('unpipe', (src) => {
        expect(src).to.eql(reader);
        done();
      });
      reader.pipe(simplePassThrough);
      reader.unpipe(simplePassThrough);

    });

});
