var path  = require('path');

var id_fqfn = {};
var fn_
var name_fn = {};
var used_id = {};
var map;
var shims = {};

var missing = [];

var debug = require('debug')('fusepm-npm-ids');


var id = {
	register_ids: name_fn,
	register_shim: function (shim, mod) {
		mod = mod ? mod : path.join(__dirname, "..", "..", "node_modules", shim);
		debug("register_shim: setting "+shim+ " = "+mod);
		if (map[shim] == undefined) {
			map[shim] = mod;
			var my_id = id.register_fn(mod, shim);
			debug("register_shim: id");
			debug(my_id);
			if (!my_id.created) {
				missing.push(mod);
				my_id.created = 1;
			}
		}
	},
	strip_id: function (fn) {
		return id.strip_prefix(fn).replace('/lib/index.js', '').replace('/index.js', '');
	},
	strip_prefix: function (fn) {
		var current_dir = path.join(process.cwd(),"node_modules") + path.sep;
		var global_dir = path.join(__dirname, "..", "..", "node_modules") + path.sep;
		return fn.replace(current_dir,'').replace(global_dir,'');
	},
	strip_fn: function (fn) {
		var shims = path.join(__dirname) + path.sep;
		fn = id.strip_prefix(fn)
			.replace(shims, '')
			.replace('/node_modules/','_')
			.replace('/lib/index.js', '.js')
			.replace('/index.js', '.js')
			.replace('/lib/', '_');
		return fn;
	},
	uniq_fn: function (fn) {
		var try_fn = fn;
		var i = 1;
		while (used_id[try_fn]) {
			debug(fn + " already used ("+ used_id[try_fn] +")");
			i++;
			try_fn = fn + '_' + i;
		}
		return try_fn;
	},
	register_fn: function (fqfn, called_as) {
		debug("register_fn: " + fqfn);

		if (id_fqfn[fqfn]) {
			return id_fqfn[fqfn];
		}
		var fn = id.create_fn(fqfn);
		var called_fn = id.strip_fn(called_as);

		id_fqfn[fqfn] = { fn: fn };
		used_id[fn] = fqfn;
		name_fn[called_fn] = fn;
		return id_fqfn[fqfn];
	},
	create_fn: function (filename) {
		debug("create_fn: " + filename);
		if (id_fqfn[filename]) {
			debug("create_fn: already found ");
			debug(id_fqfn[filename]);
			return id_fqfn[filename].fn;
		}

		var fn = id.strip_fn(filename);
		fn = fn.replace(/[^\w\-\.]/g,"_");
		fn = "fusejs_lib/" + fn;
		if (fn.endsWith('.json')) {
			fn = fn + '.js';
		}
		fn = id.uniq_fn(fn);
		debug("create_fn: created as " + fn);
		return fn;
	},

	get_used : function (f) {
		return used_id[f];
	},
	set_map: function (new_map) {
		map = new_map;
	},
	get_require: function (req) {
		debug("req  " + req);
		var fqfn = map[req];
		debug("fqfn " + fqfn);
		if (!fqfn) {
			if (missing[req]) {
				missing[req]++;
			}
			else {
				missing[req] = 1;
			}
			return;
		}
		var rew = id_fqfn[fqfn].fn;
		debug("rew  " + rew);

		return rew;
	},
	create_missing : function () {
		if (missing.length === 0) {
			return;
		}
		var m = missing.slice();
		missing.length = 0;
		return m;
	},
	dump : function () {
		console.log("shims");
		console.log(shims);
		console.log("missing");
		console.log(missing);

	},
	shim_used : function shim_used (shim) {
		if (shims[shim]) {
			shims[shim]++;
		}
		else {
			shims[shim] = 1;
		}
	}
}
module.exports = id;