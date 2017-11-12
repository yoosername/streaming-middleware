'use strict';
var expect = require('chai').expect;
const { Transform, PassThrough } = require('stream');
var MemoryStream = require('memorystream');

describe('TransformStreamWrapper', function() {

  var TransformStreamWrapper = null;
  var MemStream = null;
  var PassStream = null;

  beforeEach(function(){
    TransformStreamWrapper = require('../../lib/TransformStreamWrapper.js');
    MemStream = new MemoryStream.createWriteStream();
    PassStream = new PassThrough();
  });

  afterEach(function(){
    TransformStreamWrapper = null;
    MemStream = null;
    PassStream = null;
  });

  it('should exist', function() {
      expect(TransformStreamWrapper).to.not.be.undefined;
  });

  it('should be a function', function() {
      expect(TransformStreamWrapper).to.be.a('function');
  });

  it('should be constructed with or without the new operator', function() {
    var withNewOperator = new TransformStreamWrapper({},function(){});
    expect(withNewOperator).to.be.an.instanceOf(TransformStreamWrapper);
    var withoutNewOperator = TransformStreamWrapper({},function(){});
    expect(withoutNewOperator).to.be.an.instanceOf(TransformStreamWrapper);
  });

  it('should bind its context to the callback function', function(done) {
    var stream = new TransformStreamWrapper(function(chunk,enc,next){
      expect(this).to.eql(stream);
      done();
    });
    PassStream.pipe(stream);
    PassStream.end(new Buffer('test data'));
  });

  it('should return a PassThrough stream if only options or nothing passed', function() {
    var stream = new TransformStreamWrapper();
    expect(stream).to.be.an.instanceOf(PassThrough);

    var stream2 = new TransformStreamWrapper({objectMode: true});
    expect(stream).to.be.an.instanceOf(Transform);
  });

  it('should return a Transform stream if a function is passed as first or second argument', function() {
    var stream = new TransformStreamWrapper(function(chunk,enc,next){});
    expect(stream).to.be.an.instanceOf(TransformStreamWrapper);
  });

  it('should pipe correctly', function() {

    var stream1 = new TransformStreamWrapper(function Upper(chunk,enc,next){
      next(null, chunk.toString().toUpperCase());
    });
    var stream2 = new TransformStreamWrapper(function Reverse(chunk,enc,next){
      next(null, chunk.toString().split("").reverse().join(""));
    });

    PassStream
    .pipe(stream1)
    .pipe(stream2)
    .pipe(MemStream)
    .on('finish', function() {
      expect(MemStream.toString()).to.eql('ATAD TSET');
      done();
    });

    PassStream.end(new Buffer('test data'));

  });

});
