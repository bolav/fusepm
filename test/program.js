
var chai = require('chai');
var assert = chai.assert;
var install = require('../lib/install');
var bump = require('../lib/bump');

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
  });

});
