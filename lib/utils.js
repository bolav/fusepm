var debug = require('debug')('fusepm-utils');
var fs = require('fs');
var path = require('path');

var local_name = '';

function verify_unoproj () {
	debug("verify_unoproj");
}

function verify_module_unoproj () {
	debug("verify_module_unoproj");
}

function find_unoproj (fpath) {
	var files = fs.readdirSync(fpath);
	var foundfiles = [];
	var re = new RegExp(/\.unoproj$/);

	for (var i = 0; i < files.length; i++) {
		if (files[i].match(re)) {
			foundfiles.push(files[i]);
			debug("found unoproj " + files[i]);
		}
	}
	return foundfiles;
}

function verify_local_unoproj (lpath) {
	debug("verify_local_unoproj");
	if (local_name !== '') return local_name;
	var files = find_unoproj(lpath);
	if (files.length < 1) {
		throw new Error('Unable to find unoproj');
	}
	else if (files.length > 1) {
		throw new Error('Specifiy unoproj file. Several found');
	}
	local_name = path.normalize(path.join(process.cwd(), lpath, files[0]));
	return local_name;
}

function addto_unoproj () {
	debug("addto_unoproj");
}

module.exports = {
	verify_unoproj: verify_unoproj,
	verify_module_unoproj: verify_module_unoproj,
	verify_local_unoproj: verify_local_unoproj,
	addto_unoproj: addto_unoproj

};