var fusepm = require('./fusepm');

module.exports = fixunoproj;

function fixunoproj () {
	var fn = fusepm.local_unoproj(".");
	fusepm.read_unoproj(fn).then(function (obj) {
		var inc = [];
		if (obj.Includes) {
			var re = /\//;
			for (var i=0; i<obj.Includes.length;i++) {
				if (obj.Includes[i] === '*') {
					inc.push('./*.ux');
					inc.push('./*.uno');
					inc.push('./*.uxl');
				}
				else if (!obj.Includes[i].match(re)) {
					inc.push('./' + obj.Includes[i]);
				}
				else {
					inc.push(obj.Includes[i]);
				}

			}
		}
		else {
			inc = ['./*.ux', './*.uno', './*.uxl'];
		}
		if (!obj.Version) {
			obj.Version = "0.0.0";
		}
		obj.Includes = inc;
		fusepm.save_unoproj(fn, obj);
	}).catch(function (e) {
		console.log(e);
	});
}