
var chai = require('chai');
require('mocha-sinon');

var assert = chai.assert;
var install = require('../lib/install');

var fs = require('fs');




process.chdir('test');

describe('live', function () {
  describe('install', function () {
  	this.timeout(20000);
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
	it('should install fuse-cocoapods', function () {
	  try {
	      fs.accessSync('fuse_modules/bolav/fuse-cocoapods/cocoapods_include.unoproj', fs.F_OK);
	      assert.isOk(1, 'cocoapods_include exists')
	      // Do something
	  } catch (e) {
	      // It isn't accessible
	      assert.fail('', 'cocoapods_include', 'cocoapods_include does not exists');
	  }

	});
	it('should install fuse-dropbox', function () {
	  try {
	      fs.accessSync('fuse_modules/bolav/fuse-dropbox/dropbox_include.unoproj', fs.F_OK);
	      assert.isOk(1, 'dropbox_include exists')
	      // Do something
	  } catch (e) {
	      // It isn't accessible
	      assert.fail('', 'dropbox_include', 'dropbox_include does not exists');
	  }

	});
	it('should install fuse-foreignhelpers', function () {
	  try {
	      fs.accessSync('fuse_modules/bolav/fuse-foreignhelpers/foreignhelpers_include.unoproj', fs.F_OK);
	      assert.isOk(1, 'foreignhelpers_include exists')
	      // Do something
	  } catch (e) {
	      // It isn't accessible
	      assert.fail('', 'foreignhelpers_include', 'foreignhelpers_include does not exists');
	  }

	});
	it('should install sqlite_include', function () {
	  try {
	      fs.accessSync('fuse_modules/bolav/fuse-sqlite/sqlite_include.unoproj', fs.F_OK);
	      assert.isOk(1, 'sqlite_include exists')
	      // Do something
	  } catch (e) {
	      // It isn't accessible
	      assert.fail('', 'sqlite_include', 'sqlite_include does not exists');
	  }

	});
  });

});
