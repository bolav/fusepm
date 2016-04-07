var debug = require('debug')('fusepm-utils');
var fs = require('fs');
var path = require('path');
var parser = require('json-parser');
var RepairStream = require('jsonrepair').RepairStream;

var clarinet = require("clarinet");

module.exports = new Utils();


function Utils() {
	return this;
}



var local_name = '';

Utils.prototype.verify_module_unoproj = function verify_module_unoproj (fpath) {
	debug("verify_module_unoproj");
	var files = find_unoproj(fpath, 1, new RegExp(/include\.unoproj$/));
	if (files.length < 1) {
		throw new Error('Unable to find unoproj');
	}
	else if (files.length > 1) {
		throw new Error('Specifiy unoproj file. Several found');
	}
	var unoproj = path.normalize(path.join(process.cwd(), fpath, files[0]));
	return unoproj;

}

Utils.prototype.find_unoproj = function find_unoproj (fpath, count, re) {
	var files = fs.readdirSync(fpath);
	var foundfiles = [];
	if (!re) {
		re = new RegExp(/\.unoproj$/);
	}
	if (!count) {
		count = 1;
	}

	for (var i = 0; i < files.length; i++) {
		if (files[i].match(re)) {
			foundfiles.push(files[i]);
			debug("found unoproj " + files[i]);
		}
	}

	if (foundfiles.length !== count) {
		throw new Error('Found ' + foundfiles.length + ' unoproj files. Wanted ' + count);
	}

	return foundfiles;
}

Utils.prototype.local_unoproj = function local_unoproj(lpath) {
	if (local_name !== '') return local_name;
	var re;
	if (this.commander.unoproj) {
		re = new RegExp(this.commander.unoproj);
	}
	var files = find_unoproj(lpath, 1, re);
	local_name = path.normalize(path.join(process.cwd(), lpath, files[0]));
	return local_name;
}

Utils.prototype.verify_local_unoproj = function verify_local_unoproj (lpath) {
	debug("verify_local_unoproj");
	return new Promise(function (resolve, reject) {
		var fn = local_unoproj(lpath);
		read_unoproj(fn).then(function (obj) {
			if (obj.Includes) {
				var re = /\//;
				for (var i=0; i<obj.Includes.length;i++) {
					if (obj.Includes[i] === '*') {
						debug("'Includes: ['*']' is not supported by fusepm");
						return reject(new Error("'Includes: ['*']' is not supported by fusepm"));
					}
					else if (!obj.Includes[i].match(re)) {
						console.log("Includes without '/' works poorly with fusepm : "+ obj.Includes[i]);
					}

				}
				return resolve(local_name);
			}
			else {
				return resolve(local_name);
			}
		});
	});
}

Utils.prototype.read_unoproj = function read_unoproj (fn) {
	return new Promise(function(resolve, reject) {
		var repairRules = [
		{
		    description: 'Removing trailing comma within array',
		    character: ']',
		    expected: 'VALUE',
		    action: function(parser) {
		        parser.stack.pop();
		        parser.onclosearray();
		        var newState = parser.stack.pop();
		        parser.state = newState;
		    }
		},
		{
		    description: 'Removing trailing comma within hash',
		    character: '}',
		    expected: 'OPEN_KEY',
		    action: function(parser) {
		        parser.stack.pop();
		        parser.oncloseobject();
		        var newState = parser.stack.pop();
		        parser.state = newState;
		    }
		},
		];
		var repairJson = new RepairStream(repairRules);


		var npm_stream = clarinet.createStream();
		var s = fs.createReadStream(fn)
		var p = s.pipe(repairJson).pipe(npm_stream);
		var json = '';
		p.on('data', function (chunk) {
			json += chunk;
		});
		p.on('end', function () {
			var obj = JSON.parse(json);
			resolve(obj);
		})
		s.resume();		
	});

}

Utils.prototype.addto_unoproj = function addto_unoproj (addobj) {
	debug("addto_unoproj");
	var obj = read_unoproj(local_name);
	return obj.then(function (obj) {
		if (addobj.Projects) {
			if (!obj.Projects) {
				obj.Projects = [addobj.Projects];
			} else if (obj.Projects.indexOf(addobj.Projects) < 0)
				obj.Projects.push(addobj.Projects);
		}
		if (addobj.Version) {
			obj.Version = addobj.Version;
		}
		debug(obj);
		return obj;
	});
}

Utils.prototype.save_unoproj = function save_unoproj (fn, obj) {
	debug("save_unoproj");
	fs.writeFileSync(fn, JSON.stringify(obj, null, 4) + "\n", 'utf8');
}

Utils.prototype.save_to_unoproj = function save_to_unoproj (fn, addobj) {
	debug("save_to_unoproj " + fn);
	addto_unoproj(addobj)
		.then(function (obj) {
			save_unoproj(fn, obj);
		});
}

Utils.prototype.set_commander = function set_commander (commander) {
	this.commander = commander;
}


