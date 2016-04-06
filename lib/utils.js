var debug = require('debug')('fusepm-utils');
var fs = require('fs');
var path = require('path');
var parser = require('json-parser');
var RepairStream = require('jsonrepair').RepairStream;

var clarinet = require("clarinet");

var local_name = '';

function verify_unoproj () {
	debug("verify_unoproj");
}

function verify_module_unoproj (fpath) {
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

function find_unoproj (fpath, count, re) {
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

function verify_local_unoproj (lpath) {
	debug("verify_local_unoproj");
	if (local_name !== '') return local_name;
	var files = find_unoproj(lpath, 1);
	local_name = path.normalize(path.join(process.cwd(), lpath, files[0]));
	return local_name;
}

function read_unoproj (fn) {
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

function addto_unoproj (addobj) {
	debug("addto_unoproj");
	var obj = read_unoproj(local_name);
	return obj.then(function (obj) {
		if (addobj.Projects) {
			if (!obj.Projects) {
				obj.Projects = [addobj.Projects];
			} else if (obj.Projects.indexOf(addobj.Projects) < 0)
				obj.Projects.push(addobj.Projects);
		}
		debug(obj);
		return obj;
	});
}

function save_unoproj (obj) {
	debug("save_unoproj");
	fs.writeFileSync(local_name, JSON.stringify(obj, null, 4) + "\n", 'utf8');
}

module.exports = {
	verify_unoproj: verify_unoproj,
	verify_module_unoproj: verify_module_unoproj,
	verify_local_unoproj: verify_local_unoproj,
	addto_unoproj: addto_unoproj,
	save_unoproj: save_unoproj

};