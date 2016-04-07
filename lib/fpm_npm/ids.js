var path  = require('path');

var id_id = {};
var name_fn = {};
var used_id = {};
var map;
var shims = {};
var missing = {};
var created_missing = 0;
module.exports = {
	register_ids: name_fn,
	add_id: function (orig, f, jsfn) {
		id_id[orig] = f;
		used_id[f] = 1;
		name_fn[jsfn] = f;
	},
	get_used : function (f) {
		return used_id[f];
	},
	set_map: function (new_map) {
		map = new_map;
	},
	get_require: function (req) {
		var fqfn = map[req];
		if (!fqfn) {
			if (missing[req]) {
				missing[req]++;
			}
			else {
				missing[req] = 1;
			}
		}
		var rew = id_id[fqfn];
		return rew;
	},
	create_missing : function () {
		if (created_missing) {
			return;
		}
		created_missing = 1;
		var mods = [];
		for (var mod in missing) {
			if (mod === "undefined") {
				continue;
			}
			if (used_id[mod]) {
				continue;
			}
			mods.push(path.join(path.parse(__filename).dir, "..", "node_modules", mod));
		}
		return mods;
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
