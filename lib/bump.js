var fusepm = require('./utils');
var semver = require('semver');

module.exports = bump;

function bump (cmd, options) {
	cmd = cmd.toLowerCase();
	var re = /^(major|premajor|minor|preminor|patch|prepatch|prerelease)$/i;
	if (! cmd.match(re)) {
		throw new Error(cmd + " is not a valid release type release type (major, premajor, minor, preminor, patch, prepatch, or prerelease)");
	}
	
	fusepm.verify_local_unoproj(".").then(function (fn) {
		fusepm.read_unoproj(fn).then(function (obj) {
			var ver = obj.Version ? obj.Version : "0.0.0";
			ver = semver.inc(ver, cmd);
			fusepm.save_to_unoproj(fn, {Version: ver});

		}).catch(function (e) {
			console.log(e);
		});
	});
}
