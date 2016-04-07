
var debug = require('debug')('fusepm-install');
var npa = require('npm-package-arg');
var hostedFromURL = require('hosted-git-info').fromUrl;
var normalizeGitUrl = require('normalize-git-url');
var mkdir = require('mkdirp');
var fusepm = require('./fusepm');
var fs = require('fs');
var path = require('path');

var npm = require('npm');
var git;
var conf = {};
var original_file = '';

module.exports = install;

function install (cmd, options) {
	/*
	var ready = new Promise(function (resolve, reject) {
	});*/
	debug('install');
	fusepm.verify_local_unoproj(".").then(function (fn) {
		original_file = fn;
		install_to_file(fn, cmd);
	}).catch(function (e) {
		console.log(e.message);
		return e;
	});
}

function install_to_file(fn, cmd) {
	debug("install_to_file: " + fn + ", " + cmd);
	var parsed = hostedFromURL(cmd);
	if (parsed) {
		npm.load(conf, function (er) {
			if (er)
				throw er;
			git = require('npm/lib/utils/git');
			var install_path = 'fuse_modules/' + parsed.path();
			var stats;
			try {
				stats = fs.statSync(install_path);
			}
			catch (e) {
			}
			if (stats && stats.isDirectory()) {
				return postinstall(fn, install_path);
			}
			cloneRemote(parsed.path(), parsed.toString(), install_path, function (error) { if (error) throw error; postinstall(fn, install_path) });
			return;
		});
		return;
	}
	parsed = npa(cmd);
}

function postinstall (local_unoproj, install_path) {
	var unoproj_fn = fusepm.verify_module_unoproj(install_path);
	fusepm.read_unoproj(unoproj_fn).then(function (obj) {
		if (obj.Projects) {
			debug("Installing dependencies");
			for (var i=0; i < obj.Projects.length; i++) {
				var parsed = hostedFromURL(obj.Projects[i]);
				if (!parsed) {
					parsed = npa(obj.Projects[i]);
					if (parsed.type === 'local') return;
				}
				debug(parsed);
				var install_uri = obj.Projects[i];
				debug("Installing " + install_uri);
				fusepm.delete_unoproj(unoproj_fn, {Projects: install_uri}).then(function () {
					debug("Delete done, starting install");
					install_to_file(unoproj_fn, install_uri);
				});
			}
		}
	});
	fusepm.save_to_unoproj(local_unoproj, {Projects: unoproj_fn, Excludes: 'fuse_modules/' });
	if (local_unoproj !== original_file) {
		fusepm.save_to_unoproj(original_file, {Projects: unoproj_fn, Excludes: 'fuse_modules/' });
	}
}

// Copied from npm:

// make a complete bare mirror of the remote repo
// NOTE: npm uses a blank template directory to prevent weird inconsistencies
// https://github.com/npm/npm/issues/5867
function cloneRemote (from, cloneURL, libdir, cb) {
  var normalized = normalizeGitUrl(cloneURL);
  cloneURL = normalized.url

  debug(cloneURL);

  mkdir(libdir, function (er) {
    if (er) return cb(er);

    var args = [
      'clone',
      cloneURL, libdir
    ]
    git.whichAndExec(
      ['clone', cloneURL, libdir],
      { cwd: '.' },
      function (er, stdout, stderr) {
        if (er) {
          var combined = (stdout + '\n' + stderr).trim()
          var command = 'git ' + args.join(' ') + ':'
          debug(command, combined)
          return cb(er);
        }
        debug('mirrorRemote', from, 'git clone ' + cloneURL, stdout.trim());
        cb(null);
      }
    )
  })
}
