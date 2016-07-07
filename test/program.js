
var chai = require('chai');
require('mocha-sinon');

var assert = chai.assert;
var install = require('../lib/install');
var bump = require('../lib/bump');
var list = require('../lib/list');

describe('modules', function () {
  describe('install', function () {
  	it('should be a function', function () {
  		assert.typeOf(install, 'function');
	  });
  }),
  describe('bump', function () {
	  it('should be a function', function () {
		  assert.typeOf(bump, 'function');
	  });
  }),
  describe('list', function () {
    beforeEach(function() {
      this.sinon.stub(console, 'log');
    }),
    it('should be a function', function () {
     assert.typeOf(list, 'function');
    }),
    it('should output modules', function () {
      list();
      chai.expect( console.log.callCount == 3 ).to.be.true;
    });
  });

});
