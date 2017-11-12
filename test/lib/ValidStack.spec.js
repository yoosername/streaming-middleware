'use strict';
var expect = require('chai').expect;

describe('ValidStack', function() {

  var ValidStack = null;

  beforeEach(function(){
    ValidStack = require('../../lib/ValidStack.js');
  });

  afterEach(function(){
    ValidStack = null;
  });

  it('should exist', function() {
      expect(ValidStack).to.not.be.undefined;
  });

  it('should be a function', function() {
      expect(ValidStack).to.be.a('function');
  });

  it('should throw error if stack is invalid', function() {

    var BadArrayErrorText = /Stack validation failed: stack must exist and be a non empty array/;
    expect(function(){ValidStack()}).to.throw(Error, BadArrayErrorText);
    expect(function(){ValidStack(null)}).to.throw(Error, BadArrayErrorText);
    expect(function(){ValidStack(undefined)}).to.throw(Error, BadArrayErrorText);
    expect(function(){ValidStack("undefined")}).to.throw(Error, BadArrayErrorText);
    expect(function(){ValidStack("random_string")}).to.throw(Error, BadArrayErrorText);
    expect(function(){ValidStack({})}).to.throw(Error, BadArrayErrorText);
    expect(function(){ValidStack([])}).to.throw(Error, BadArrayErrorText);

    var BadFunctionSignatureErrorText = /Stack validation failed: transform functions must have signature/;
    expect(function(){ValidStack([function(){}])}).to.throw(Error, BadFunctionSignatureErrorText);
    expect(function(){ValidStack([function(one,two){}])}).to.throw(Error, BadFunctionSignatureErrorText);
    expect(function(){ValidStack([function(onw,two,three,four){}])}).to.throw(Error, BadFunctionSignatureErrorText);

  });

});
