
var npm_fpm = require('./fpm_npm/modules');
var fusepm = require('./fusepm');

module.exports = npm;

function npm (modules, program) {
	npm_fpm(modules, function (ids) {
		console.log("Result of npm:");
		console.log(ids);
	});
	fusepm.verify_local_unoproj(".").then(function (fn) {
		fusepm.save_to_unoproj(fn, { Includes: 'fusejs_lib/*.js:Bundle' });
	});

}

