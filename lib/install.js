
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
	return new Promise(function (resolve, reject) {
		fusepm.verify_local_unoproj(".").then(function (fn) {
			original_file = fn;
			if (cmd.length > 0) {
				install_deps(fn, cmd, 0, resolve, reject);
			}
			else {
				debug("install all from " + fn);
				fusepm.read_unoproj(fn).then(function (obj) {
					if (obj.FusePM && obj.FusePM.Dependencies) {
						debug("installing " + obj.FusePM.Dependencies);
						install_deps(fn, obj.FusePM.Dependencies, 0, resolve, reject);
					}
					else {
						resolve("no deps");
					}
				});
			}
		}).catch(function (e) {
			console.log(e.message);
			reject(e);
		});
	});
}

function install_deps(file, files, i, resolve, reject) {
	debug("install_deps " + file + ", " + files[i]);
	install_to_file(file, files[i]).then(function () {
		if (i + 1 < files.length) {
			install_deps(file, files, i+1, resolve, reject);
		}
		else {
			debug("install_deps done");
			resolve("done");
		}
	}).catch(function (e) {
		console.log("install_deps catch: " + e);
		reject(e);
	})
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

  return new Promise(function (resolve, reject) {
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
  		  	return postInstall(package, fn, install_path).then(function () {
  	      		resolve("postInstall");
  	      	});
  		  }
  	    cloneRemote(parsed.path(), parsed.toString(), install_path, function (error) {
  	    	reject(error);
	        postInstall(package, fn, install_path).then(function () {
  	        	resolve("postInstall");
  	        });
  	    });
  	  }
  	  parsed = npa(package);
  	});
  });

}


function postInstall (package, local_unoproj, install_path) {
	var unoproj_fn = fusepm.verify_module_unoproj(install_path);

	function _install_deps (deps, i) {
		debug("_next");
		console.log("Started");
		var dep = deps[i];
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
			install_to_file(unoproj_fn, install_uri).then(function () {
				if (i + 1 < deps.length) {
					_next(deps, i + 1);
				}
				else {
					resolve("postInstall");
				}
			})
		});
	}

	return new Promise(function (resolve, reject) {
		fusepm.read_unoproj(unoproj_fn).then(function (obj) {
			fusepm.save_to_unoproj(local_unoproj, {
				Projects: path.relative(path.dirname(local_unoproj), unoproj_fn),
				Excludes: 'fuse_modules/',
				FusePM: { Dependencies: package }
			}).then(function () {
				if (obj.FusePM) {

					debug("Installing dependencies");
					debug(obj.FusePM.Dependencies);
					debug("Calling _next");
					_install_deps(obj.FusePM.Dependencies, 0);
				}
			})
		});
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
