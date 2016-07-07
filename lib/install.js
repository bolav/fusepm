
var debug = require('debug')('fusepm-install');
var npa = require('npm-package-arg');
var hostedFromURL = require('hosted-git-info').fromUrl;
var normalizeGitUrl = require('normalize-git-url');
var mkdir = require('mkdirp');
var fusepm = require('./fusepm');
var fs = require('fs');
var path = require('path');
var repo = require('../repository');

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
	debug(cmd);
	fusepm.verify_local_unoproj(".").then(function (fn) {
		original_file = fn;
		if (cmd.length > 0) {
			for (var i = 0; i<cmd.length; i++) {
				install_to_file(fn, cmd[i]);
			}
		}
		else {
			debug("install all from " + fn);
			fusepm.read_unoproj(fn).then(function (obj) {
				if (obj.FusePM && obj.FusePM.Dependencies) {
					cmd = obj.FusePM.Dependencies;
					for (var i = 0; i<cmd.length; i++) {
						install_to_file(fn, cmd[i]);
					}
				}
			});
		}
	}).catch(function (e) {
		console.log(e.message);
		return e;
	});
}

function lookupPackage(package) {
  return repo[package];
}

function install_to_file(fn, searchPackage) {
  if (!searchPackage.match(/:/)) {
    package = lookupPackage(searchPackage);
    console.log("Lookup: ", searchPackage, package);
  } else {
    package = searchPackage;
  }

	npm.load(conf, function (er) {
    if (er)
      throw er;
    var parsed = hostedFromURL(package);
    if (parsed) {
      console.log("Installing dependency", parsed.path());
  		git = require('npm/lib/utils/git');
  		var install_path = 'fuse_modules/' + parsed.path();
  		var stats;
  		try {
  			stats = fs.statSync(install_path);
  		}
  		catch (e) {
  		}
  		if (stats && stats.isDirectory()) {
  			return postInstall(package, fn, install_path);
  		}
      console.log("P: ", parsed);
      cloneRemote(parsed.path(), parsed.toString(), install_path, function (error) {
        if (error) throw error;
        postInstall(package, fn, install_path);
      });
    }
    parsed = npa(package);
  });
}


function postInstall (package, local_unoproj, install_path) {
	var unoproj_fn = fusepm.verify_module_unoproj(install_path);
	fusepm.read_unoproj(unoproj_fn).then(function (obj) {
		if (obj.FusePM) {
			debug("Installing dependencies");
			debug(obj.FusePM && obj.FusePM.Dependencies);
			for (var i=0; i < obj.FusePM.Dependencies.length; i++) {
				var dep = obj.FusePM.Dependencies[i];
				var parsed = hostedFromURL(dep);
				if (!parsed) {
					parsed = npa(dep);
					if (parsed.type === 'local') return;
				}
				debug(parsed);
				var install_uri = dep;
				debug("Installing " + install_uri);
				fusepm.delete_unoproj(unoproj_fn, {Projects: install_uri}).then(function () {
					debug("Delete done, starting install");
					install_to_file(unoproj_fn, install_uri);
				});
			}
		}
	});
	fusepm.save_to_unoproj(local_unoproj, {
		Projects: path.relative(path.dirname(local_unoproj), unoproj_fn),
		Excludes: 'fuse_modules/',
		FusePM: { Dependencies: package }
	});
}

// Copied from npm:

// make a complete bare mirror of the remote repo
// NOTE: npm uses a blank template directory to prevent weird inconsistencies
// https://github.com/npm/npm/issues/5867
function cloneRemote(from, cloneURL, libdir, cb) {
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
