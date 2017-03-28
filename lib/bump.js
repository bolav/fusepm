var fusepm = require('./fusepm');
var semver = require('semver');

module.exports = bump;

module.exports.new_version = new_version;

function new_version(ver, cmd, setver) {
	if (cmd.match(/^[\.\d]+$/)) {
		ver = cmd;
	}
	else if (cmd === 'show') {
		console.log(ver);
	}
	else if (setver) {
		if (cmd === "patch") {
			ver = semver.major(ver) + "." + semver.minor(ver) + "." + setver;
		}
		else {
			throw new Error("Only supports setting version for patch");
		}
	}
	else {
		ver = semver.inc(ver, cmd, null, 12);				
	}
	return ver;
}

function bump (cmd, version, options) {
	cmd = cmd.toLowerCase();
	var re = /^(major|premajor|minor|preminor|patch|prepatch|prerelease|\d+\.\d+\.\d+|show)$/i;
	if (! cmd.match(re)) {
		throw new Error(cmd + " is not a valid release type release type (major, premajor, minor, preminor, patch, prepatch, or prerelease)");
	}
	
	fusepm.verify_local_unoproj(".").then(function (fn) {
		fusepm.read_unoproj(fn).then(function (obj) {
			var ver = obj.Version ? obj.Version : "0.0.0";
			ver = new_version(ver, cmd, version);
			fusepm.save_to_unoproj(fn, {Version: ver});

		}).catch(function (e) {
			console.log(e);
		});
	});
}
