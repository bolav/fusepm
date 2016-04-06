
var debug = require('debug')('fusepm');
var npa = require('npm-package-arg');
var hostedFromURL = require('hosted-git-info').fromUrl;
var normalizeGitUrl = require('normalize-git-url');
var mkdir = require('mkdirp');
var fusepm = require('./utils');
var fs = require('fs');

var npm = require('npm');
var git;
var conf = {};

module.exports = install;

function install (cmd, options) {
	/*
	var ready = new Promise(function (resolve, reject) {
	});*/
	fusepm.verify_local_unoproj(".");
	debug('install');
	var parsed = hostedFromURL(cmd);
	if (parsed) {
		npm.load(conf, function (er) {
			if (er)
				throw er;
			git = require('npm/lib/utils/git');
			var install_path = 'fuse_modules/' + parsed.path();
			try {
				var stats = fs.statSync(install_path);
				if (stats.isDirectory()) {
					return postinstall(install_path);
				}
			}
			catch (e) {

			}
			mirrorRemote(parsed.path(), parsed.toString(), install_path, function (error) { if (error) throw error; postinstall(install_path) });
			return;
		});
		return;
	}
	parsed = npa(cmd);
}

function postinstall (install_path) {
	fusepm.verify_module_unoproj(install_path);
	fusepm.addto_unoproj(install_path);
}

// Copied from npm:

// make a complete bare mirror of the remote repo
// NOTE: npm uses a blank template directory to prevent weird inconsistencies
// https://github.com/npm/npm/issues/5867
function mirrorRemote (from, cloneURL, libdir, cb) {
  var normalized = normalizeGitUrl(cloneURL);
  cloneURL = normalized.url

  debug(cloneURL);

  mkdir(libdir, function (er) {
    if (er) return cb(er);

    var args = [
      'clone',
      '--mirror',
      cloneURL, libdir
    ]
    git.whichAndExec(
      ['clone', '--mirror', cloneURL, libdir],
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
