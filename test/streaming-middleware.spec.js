'use strict';
var chai = require('chai');
var chaiStream = require('chai-stream');
chai.use(chaiStream);
var expect = chai.expect;
var Util = require('util');
var Transform = require('stream').Transform;
var through2 = require("through2");

function NoopMiddleware(ctx, next){};
function NoopErrorMiddleware(err, ctx, next){};
function NoopStreamingMiddleware(ctx, next){
  Transform.call(this, {objectMode : true});
};
NoopStreamingMiddleware.prototype._transform = function _transform(chunk, encoding, callback) {
  this.push(chunk);
  callback();
};
Util.inherits(NoopStreamingMiddleware, Transform);

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

    it('should accept an optional context object during instantiation', function() {
        var StreamingMiddleware = require('../streaming-middleware.js');
        var ctx = { foo : "bar", doo : "dah" };
        var middleware = new StreamingMiddleware(ctx);
        expect(middleware).to.be.an.instanceOf(StreamingMiddleware);
    });

    it('should store the context object in a property called _context', function() {
        var StreamingMiddleware = require('../streaming-middleware.js');
        var ctx = {
          foo : "bar",
          doo : "dah",
          bla : {
            di : "bla"
          }
        };
        var middleware = new StreamingMiddleware(ctx);
        expect(middleware).to.have.property("_context");
        expect(middleware._context).to.eql(ctx);
    });

    it('should have an internal _stack property which is initially empty', function() {
        var middleware = require('../streaming-middleware.js')();
        expect(middleware).to.have.property("_stack");
        var expected = 0;
        var actual = middleware._stack.length;
        expect(actual).to.equal(expected);
    });

    it('should have an internal _errorStack property which is initially empty', function() {
        var middleware = require('../streaming-middleware.js')();
        expect(middleware).to.have.property("_errorStack");
        var expected = 0;
        var actual = middleware._errorStack.length;
        expect(actual).to.equal(expected);
    });

    it('should have an internal _stream property', function() {
        var middleware = require('../streaming-middleware.js')();
        expect(middleware).to.have.property("_stream");
    });


    describe('#use()', function() {

      it('should exist', function() {
          var app = require('../streaming-middleware.js')();
          expect(app).to.respondTo("use");
      });

      it('should take a single argument or throw an Error', function() {
          var app = require('../streaming-middleware.js')();
          var ErrorText = /StreamingMiddleware.use takes a single argument/;
          var throughFnc = through2(function(chk,enc,nxt){});

          expect(function(){app.use(NoopMiddleware)}).to.not.throw();
          expect(function(){app.use(throughFnc)}).to.not.throw();

          expect(function(){app.use(NoopMiddleware,NoopMiddleware)}).to.throw(Error, ErrorText);
          expect(function(){app.use()}).to.throw(Error, ErrorText);
          expect(function(){app.use("")}).to.throw(Error, ErrorText);
          expect(function(){app.use(1234)}).to.throw(Error, ErrorText);

      });

      it('should only allow a single function which declares 2 or 3 arguments', function() {
          var app = require('../streaming-middleware.js')();
          var ErrorText = /StreamingMiddleware.use takes a single function as an argument/;

          var oneArgFunction = function(arg1){};
          var fourArgFunction = function(arg1,arg2,arg3,arg4){};
          var ErrorText = /StreamingMiddleware.use takes a single function with the signature/;

          expect(function(){app.use(NoopMiddleware)}).to.not.throw();
          expect(function(){app.use(NoopErrorMiddleware)}).to.not.throw();

          expect(function(){app.use(oneArgFunction)}).to.throw(Error, ErrorText);
          expect(function(){app.use(fourArgFunction)}).to.throw(Error, ErrorText);

      });

      it('should increase _stack by one for every 2 arg function that is added', function() {
          var app = require('../streaming-middleware.js')();

          expect(app._stack.length).to.equal(0);
          app.use(NoopMiddleware);
          expect(app._stack.length).to.equal(1);
          app.use(NoopMiddleware);
          expect(app._stack.length).to.equal(2);

      });

      it('should not increase _errorStack when 2 arg functions are added', function() {
          var app = require('../streaming-middleware.js')();

          expect(app._errorStack.length).to.equal(0);
          app.use(NoopMiddleware);
          expect(app._errorStack.length).to.equal(0);
          app.use(NoopMiddleware);
          expect(app._errorStack.length).to.equal(0);

      });

      it('should increase _errorStack by one for every 3 arg function that is added', function() {
          var app = require('../streaming-middleware.js')();

          expect(app._errorStack.length).to.equal(0);
          app.use(NoopErrorMiddleware);
          expect(app._errorStack.length).to.equal(1);
          app.use(NoopErrorMiddleware);
          expect(app._errorStack.length).to.equal(2);

      });

      it('should not increase _stack when 4 arg functions are added', function() {
          var app = require('../streaming-middleware.js')();

          expect(app._stack.length).to.equal(0);
          app.use(NoopErrorMiddleware);
          expect(app._stack.length).to.equal(0);
          app.use(NoopErrorMiddleware);
          expect(app._stack.length).to.equal(0);

      });

    });

    describe('#stream()', function() {

      it('should exist', function() {
          var app = require('../streaming-middleware.js')();
          expect(app).to.respondTo("stream");
      });

      it('should return a transform stream', function() {
          var middleware = require('../streaming-middleware.js')();
          var stream = middleware.stream();
          expect(stream).to.be.a.ReadableStream;
          expect(stream).to.be.a.WritableStream;
      });

      it('should work as stream even if no middleware functions are configured', function() {

          var middleware = require('../streaming-middleware.js')();
          var stream = middleware.stream();
          var dataIn = '{some: "object"}';
          const chunks = [];

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
          var dataIn = '{count: 0}';
          middleware.use(through2(function(chunk, enc, next){
            var obj = JSON.parse(chunk);
            obj.count++;
            next(null, obj); // instead of this.push
          }))
          var stream = middleware.stream();
          stream.pipe(through2(function(chunk,enc,next){
            var obj = JSON.parse(chunk);
            expect(obj.count).to.equal(1);
            done();
          }))
          stream.write(dataIn);


      });

    });

    describe("#_getStreamableMiddleware", function(){

      it('should retun chain of all middleware functions which extend TransformStream', function() {

        var middleware = require('../streaming-middleware.js')();

        middleware.use(NoopMiddleware);
        middleware.use(NoopStreamingMiddleware);
        middleware.use(NoopMiddleware);
        middleware.use(NoopStreamingMiddleware);

        expect(middleware._stack.length).to.equal(4);

        var streamable = middleware._getStreamableMiddleware();
        expect(streamable.length).to.eql(2)
        expect(streamable[0]).to.eql(NoopStreamingMiddleware);
        expect(streamable[1]).to.eql(NoopStreamingMiddleware);

      });

    });

});
