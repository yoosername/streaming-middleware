'use strict';
var chai = require('chai');
var expect = chai.expect;

describe('StreamingMiddleware Module Entrypoint', function() {

    it('should be loadable', function() {
        const StreamingMiddleware = require('../index.js');
        expect(StreamingMiddleware).to.not.be.undefined;

        var newObject = new StreamingMiddleware();
        expect(newObject).to.be.an.instanceOf(StreamingMiddleware);
    });

});
