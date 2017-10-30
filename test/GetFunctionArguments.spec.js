'use strict';
var expect = require('chai').expect;

describe('GetFunctionArguments', function() {

  it('should exist', function() {
      var GetFunctionArguments = require('../lib/GetFunctionArguments.js');
      expect(GetFunctionArguments).to.not.be.undefined;
  });

  it('should be a function', function() {
      var GetFunctionArguments = require('../lib/GetFunctionArguments.js');
      expect(GetFunctionArguments).to.be.a('function');
  });

  it('should return an array', function() {
      var GetFunctionArguments = require('../lib/GetFunctionArguments.js');
      var actual = GetFunctionArguments(function(arg1,arg2){});
      expect(actual).to.be.an('Array');
  });

  it('should return correct arg results in array', function() {
      var GetFunctionArguments = require('../lib/GetFunctionArguments.js');
      var twoArgs = GetFunctionArguments(function(arg1,arg2){});
      var threeArgs = GetFunctionArguments(function(arg1,arg2,arg3){});
      var fourArgs = GetFunctionArguments(function(arg1,arg2,arg3,arg4){});
      expect(twoArgs).to.have.lengthOf(2);
      expect(threeArgs).to.have.lengthOf(3);
      expect(fourArgs).to.have.lengthOf(4);
      expect(twoArgs[0]).to.equal("arg1");
      expect(fourArgs[3]).to.equal("arg4");
  });

});
