'use strict';
var chai = require('chai');
var chaiStream = require('chai-stream');
chai.use(chaiStream);
var expect = chai.expect;
var Util = require('util');
var through = require("through2");
var stream = require("stream");
var PassThrough = stream.PassThrough;

function NoopStreamingMiddleware(chunk, enc, next){
  this.push(chunk);
  callback();
};

describe('MiddlewareChainedStream', function() {

    it('should exist', function() {
        var MiddlewareChainedStream = require('../lib/MiddlewareChainedStream.js');
        expect(MiddlewareChainedStream).to.not.be.undefined;
    });

    it('should be a function', function() {
        var MiddlewareChainedStream = require('../lib/MiddlewareChainedStream.js');
        expect(MiddlewareChainedStream).to.be.a('function');
    });

    it('should be able to be used with or without new operator', function() {
        var MiddlewareChainedStream = require('../lib/MiddlewareChainedStream.js');
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
        var MiddlewareChainedStream = require('../lib/MiddlewareChainedStream.js');

        var withoutOptionsNoStack = new MiddlewareChainedStream();
        expect(withoutOptionsNoStack).to.be.an.instanceOf(PassThrough);

        // WithOptionsNoStack
        var ErrorText = "Error instantiating MiddlewareChainedStream: transform functions must have signature (chunk,enc,next)";
        expect(function(){MiddlewareChainedStream([{}]);}).to.throw(Error, ErrorText);

        var withoutOptionsStack = new MiddlewareChainedStream([NoopStreamingMiddleware]);
        expect(withoutOptionsStack).to.be.an.instanceOf(MiddlewareChainedStream);

        var withOptionsStack = new MiddlewareChainedStream({},[NoopStreamingMiddleware]);
        expect(withOptionsStack).to.be.an.instanceOf(MiddlewareChainedStream);

    });

    it('should return a PassthroughStream if stack is empty', function() {
        var MiddlewareChainedStream = require('../lib/MiddlewareChainedStream.js');
        var withNewOperator = new MiddlewareChainedStream({},[]);
        expect(withNewOperator).to.be.an.instanceOf(PassThrough);
    });

});
