
var chai = require('chai');
require('mocha-sinon');

var assert = chai.assert;
var install = require('../lib/install');

var fs = require('fs');




process.chdir('test');

describe('live', function () {
  describe('install', function () {
  	this.timeout(30000);
  	before(function (done) {
  		install([]).then(function () {
  			done();
  		});
	});
  	it('should be a function', function () {
  	  assert.typeOf(install, 'function');
	}),
	it('should create fuse_modules', function () {
	  try {
	      fs.accessSync('fuse_modules', fs.F_OK);
	      assert.isOk(1, 'fuse_modules exists')
	      // Do something
	  } catch (e) {
	      // It isn't accessible
	      assert.fail('', 'fuse_modules', 'fuse_modules does not exists');
	  }

	});
  });

});
