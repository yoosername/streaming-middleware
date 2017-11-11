'use strict';
var expect = require('chai').expect;

describe('ValidateStack', function() {

  var ValidateStack = null;

  beforeEach(function(){
    ValidateStack = require('../../lib/ValidateStack.js');
  });

  afterEach(function(){
    ValidateStack = null;
  });

  it('should exist', function() {
      expect(ValidateStack).to.not.be.undefined;
  });

  it('should be a function', function() {
      expect(ValidateStack).to.be.a('function');
  });

  it('should throw error if stack is invalid', function() {

    var BadArrayErrorText = /Stack validation failed: stack must exist and be a non empty array/;
    expect(function(){ValidateStack()}).to.throw(Error, BadArrayErrorText);
    expect(function(){ValidateStack(null)}).to.throw(Error, BadArrayErrorText);
    expect(function(){ValidateStack(undefined)}).to.throw(Error, BadArrayErrorText);
    expect(function(){ValidateStack("undefined")}).to.throw(Error, BadArrayErrorText);
    expect(function(){ValidateStack("random_string")}).to.throw(Error, BadArrayErrorText);
    expect(function(){ValidateStack({})}).to.throw(Error, BadArrayErrorText);
    expect(function(){ValidateStack([])}).to.throw(Error, BadArrayErrorText);

    var BadFunctionSignatureErrorText = /Stack validation failed: transform functions must have signature/;
    expect(function(){ValidateStack([function(){}])}).to.throw(Error, BadFunctionSignatureErrorText);
    expect(function(){ValidateStack([function(one,two){}])}).to.throw(Error, BadFunctionSignatureErrorText);
    expect(function(){ValidateStack([function(onw,two,three,four){}])}).to.throw(Error, BadFunctionSignatureErrorText);

  });

});
