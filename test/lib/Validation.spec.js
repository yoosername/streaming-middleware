'use strict';
var expect = require('chai').expect;
const {ValidStack, ValidTransform} = require("../../lib/Validation.js");

const VALIDATION_ERROR = "Stack must be none null and contain only functions that inherit stream.Transform or have 3 args";

describe('Validation', function() {

  describe('ValidStack', function() {

    it('should exist', function() {
        expect(ValidStack).to.not.be.undefined;
    });

    it('should be a function', function() {
        expect(ValidStack).to.be.a('function');
    });

    it('should throw error if stack is invalid', function() {

      // Bad stack signatures
      expect(function(){ValidStack()}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack(null)}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack(undefined)}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack("undefined")}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack("random_string")}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack({})}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack([])}).to.throw(Error, VALIDATION_ERROR);

      // Bad function signatures
      expect(function(){ValidStack([function(){}])}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack([function(one,two){}])}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack([function(onw,two,three,four){}])}).to.throw(Error, VALIDATION_ERROR);

    });

  });

  describe('ValidTransform', function() {

    it('should exist', function() {
        expect(ValidTransform).to.not.be.undefined;
    });

    it('should be a function', function() {
        expect(ValidTransform).to.be.a('function');
    });

    it('should throw error if function is invalid', function() {

      // Bad function signatures
      expect(function(){ValidTransform(function(){})}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack(function(one,two){})}).to.throw(Error, VALIDATION_ERROR);
      expect(function(){ValidStack(function(one,two,three,four){})}).to.throw(Error, VALIDATION_ERROR);

    });

  });

});
