var mdeps = require('module-deps');
var debug = require('debug')('fusepm-npm');

var builtins = require('browserify/lib/builtins');
var xtend = require('xtend');

var fs    = require('fs');
var path  = require('path');
var each = require("lodash/each");
var babel = require('babel-core');
var ids = require('./ids');
var resolver = require('./fuse-resolve');
// var resolver = require('resolve');

module.exports = function (modules, cb) {
	function create_array(module_name) {
		mopts = { resolve: resolver };
		mopts.extensions = [ '.js', '.json' ];
		mopts.modules = xtend(builtins);
		var md = mdeps(mopts);

		md.on('data', function process_data (file) {
			var fn = create_fn(file.id);
			register(fn, file.id, strip_id(file.file));
		});
		md.on('end', function () {
			array_done();
		});
		md.end({ file: module_name });		
	}
	function find_module(module_name) {
		mopts = { resolve: resolver };
		mopts.extensions = [ '.js', '.json' ];
		mopts.modules = xtend(builtins);
		var md = mdeps(mopts);
		var trans_opts = { highlightCode: true,
						   presets: 'es2015,react,stage-2',
                           plugins: 'transform-object-assign,transform-fuse',
                           // plugins: 'transform-bolav-debug',
                           comments: true,
                           babelrc: false,
                           ignore: null,
                           // filename: 'g.js',
                           only: null };

		md.on('data', function process_data (file) {
			var fn = create_fn(file.id);
			ids.set_map(file.deps);
			var src_fn = path.join(path.parse(__filename).dir, fn);
			if (/\.json$/.test(file.id)) {
				fs.writeFileSync(fn, "module.exports=" + file.source);
				return;
			}

			trans_opts.filename = src_fn;
			var trans = babel.transform(file.source, trans_opts);
			fs.writeFileSync(fn, trans.code);
		});
		md.on('end', function () {
			find_done();
		});
		md.end({ file: module_name });
	}
	function register (fn, orig, jsfn) {
		ids.add_id(orig, fn, jsfn);
	}
	function mkdirSync (path) {
	  try {
	    fs.mkdirSync(path);
	  } catch(e) {
	    if ( e.code != 'EEXIST' ) throw e;
	  }
	}
	function removeFiles (path) {
		debug("deleting all files in " + path);
		fs.readdirSync(path).forEach(function(file,index){
		  var curPath = path + "/" + file;
		  // console.log(curPath);
		  fs.unlinkSync(curPath);
		});
	}
	function find_done () {
		if (modules.length) {
			module_name = modules.shift();
			create_array(module_name);
			return;
		}
		var missing_mods = ids.create_missing();
		if (missing_mods) {
			modules = modules.concat(missing_mods);
			find_done();
			return;
		}
		// ids.dump();
		cb(ids.register_ids);
	}
	function array_done () {
		debug("find_module");
		find_module(module_name);
	}
	function strip_id (fn) {
		return strip_prefix(fn).replace('/lib/index.js', '').replace('/index.js', '');
	}
	function strip_prefix(fn) {
		var current_dir = path.join(process.cwd(),"node_modules") + path.sep;
		var global_dir = path.join(__dirname, "..", "..", "node_modules") + path.sep;
		return fn.replace(current_dir,'').replace(global_dir,'');
	}
	function strip_fn (fn) {
		var shims = path.join(__dirname) + path.sep;
		fn = strip_prefix(fn)
			.replace(shims, '')
			.replace('/node_modules/','_')
			.replace('/lib/index.js', '.js')
			.replace('/index.js', '.js')
			.replace('/lib/', '_');
		return fn;
	}
	function uniq_fn (fn) {
		var fs = require('fs');
		var try_fn = fn;
		var i = 1;
		var found = true;
		while (found) {
			try {
			    // Query the entry
			    stats = fs.lstatSync(try_fn);
			    found = true;
			    i++;
			    try_fn = fn + '_' + i;
			}
			catch (e) {
				found = false;
			}
		}
		return try_fn;
	}

	function create_fn (filename) {
		var fn = strip_fn(filename);
		fn = fn.replace(/[^\w\-\.]/g,"_");
		fn = "fusejs_lib/" + fn;
		fn = uniq_fn(fn);
		return fn;
	}

	mkdirSync("fusejs_lib");
	removeFiles("fusejs_lib");
	debug("create_array");
	// modules.push(path.join(__dirname, "..", "shims", "document.js"));
	module_name = modules.shift();
	create_array(module_name);
};
