
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

	debug('install ' + cmd);
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
						debug("install installing " + obj.FusePM.Dependencies);
						install_deps(fn, obj.FusePM.Dependencies, 0, resolve, reject);
					}
					else {
						resolve("no deps");
					}
				}).catch(function (e) {
					console.log("install read_unoproj.catch: " + e.message);
					reject(e);
				})
			}
		}).catch(function (e) {
			console.log("install verify_local_unoproj.catch: " + e.message);
			reject(e);
		});
	});
}


function lookupPackage(package) {
  return repo[package];
}

function install_to_file(fn, searchPackage) {
	debug("install_to_file " + searchPackage);

  if (!searchPackage.match(/:/)) {
    package = lookupPackage(searchPackage);
    console.log("Lookup: ", searchPackage, package);
  } else {
    package = searchPackage;
  }

<<<<<<< HEAD
  return new Promise(function (resolve, reject) {
  	npm.load(conf, function (er) {
  	  if (er) {
  	  	console.log("install_to_file npm.load: " + er.message);
  	  	reject(er);
  	  	return;
  	  }

  	  var parsed = hostedFromURL(package);
  	  if (parsed) {
			debug("install_to_file dependency", parsed.path());
			git = require('npm/lib/utils/git');
			var install_path = 'fuse_modules/' + parsed.path();
			var stats;
			try {
				stats = fs.statSync(install_path);
			}
			catch (e) {
			}
			if (stats && stats.isDirectory()) {
				debug("install_to_file directory exists");
				postInstall(package, fn, install_path).then(function () {
					debug("install_to_file postInstall done")
					resolve("postInstall");
				}).catch(function (e) {
					console.log("install_to_file postInstall done.catch: " + e.message);
					reject(e);
				});
			}
			else {
				cloneRemote(parsed.path(), parsed.toString(), install_path, function (error) {
					debug("install_to_file cloneRemote finished");
					if (error) {
						reject(error);
					}
					else {
						postInstall(package, fn, install_path).then(function () {
							debug("install_to_file postInstall done");
							resolve("postInstall");
						}).catch(function (e) {
							console.log("install_to_file postInstall done.catch: " + e.message);
							reject(e);
						});
					}
				});
			}
  	  }
  	  parsed = npa(package);
  	});
  });

}


function postInstall (package, local_unoproj, install_path) {
	debug("postInstall " + package);
	var unoproj_fn = fusepm.verify_module_unoproj(install_path);

	function _install_deps (deps, i, resolve, reject) {
		debug("postInstall _install_deps " + i);
		var dep = deps[i];
		var parsed = hostedFromURL(dep);
		if (!parsed) {
			parsed = npa(dep);
			if (parsed.type === 'local') return;
		}
		debug(parsed);
		var install_uri = dep;
		debug("postInstall _install_deps " + install_uri);
		fusepm.delete_unoproj(unoproj_fn, {Projects: install_uri}).then(function () {
			debug("postInstall _install_deps delete_unoproj done");
			install_to_file(unoproj_fn, install_uri).then(function () {
				debug("postInstall _install_deps install_to_file done");
				if (i + 1 < deps.length) {
					debug("postInstall _install_deps.next " + deps.length);
					_install_deps(deps, i + 1, resolve, reject);
				}
				else {
					resolve("postInstall");
				}
			}).catch(function (e) {
				console.log("postInstall _install_deps install_to_file.catch: " + e.message);
				reject(e);
			});
		}).catch(function (e) {
			console.log("postInstall _install_deps delete_unoproj.catch: " + e.message);
			reject(e);
		});
	}

	return new Promise(function (resolve, reject) {
		fusepm.read_unoproj(unoproj_fn).then(function (obj) {
			debug("postInstall read_unoproj done");
			fusepm.save_to_unoproj(local_unoproj, {
				Projects: path.relative(path.dirname(local_unoproj), unoproj_fn),
				Excludes: 'fuse_modules/',
				FusePM: { Dependencies: package }
			}).then(function () {
				debug("postInstall save_to_unoproj done");
				if (obj.FusePM) {

					debug("postInstall save_to_unproj install_deps");
					debug(obj.FusePM.Dependencies);
					_install_deps(obj.FusePM.Dependencies, 0, resolve, reject);
				}
				else {
					debug("postInstall save_to_unoproj No deps");
					resolve("no deps");
				}
			}).catch(function (e) {
				console.log("postInstall save_to_unoproj.catch: " + e.message);
				reject(e);
			});
		}).catch(function (e) {
			console.log("postInstall read_unoproj.catch: " + e.message);
			reject(e);
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
