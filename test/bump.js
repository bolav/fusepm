
var chai = require('chai');
require('mocha-sinon');

var assert = chai.assert;
var bump = require('../lib/bump');

describe('modules', function () {
  describe('bump', function () {
	  it('should be a function', function () {
		  assert.typeOf(bump, 'function');
	  }),
    it('should expose new_version', function () {
      assert.typeOf(bump.new_version, 'function');
    }),
    it('should handle patch', function () {
      assert.equal(bump.new_version('0.0.0', 'patch'), '0.0.1');
    })
    it('should handle version', function () {
      assert.equal(bump.new_version('1.2.0', '2.2.10'), '2.2.10');
    })
    it('should handle setting patch', function () {
      assert.equal(bump.new_version('1.2.0', 'patch', '5'), '1.2.5');
    })
  });
});
