
var debug = require('debug')('fusepm');
var npa = require('npm-package-arg');
var hostedFromURL = require('hosted-git-info').fromUrl

var npm = require('npm');
var git;
var conf = {};

module.exports = install;

function install (cmd, options) {
	/*
	var ready = new Promise(function (resolve, reject) {
	});*/
	debug('install');
	var parsed = hostedFromURL(cmd);
	if (parsed) {
		npm.load(conf, function (er) {
			if (er)
				throw er;
			git = require('npm/lib/utils/git');
			return tryClone(from, parsed.toString(), false, cb)

		});
		return;
	}
	parsed = npa(cmd);
}

// Copied from npm:

// make a complete bare mirror of the remote repo
// NOTE: npm uses a blank template directory to prevent weird inconsistencies
// https://github.com/npm/npm/issues/5867
function mirrorRemote (from, cloneURL, cachedRemote, silent, cb) {
  mkdir(cachedRemote, function (er) {
    if (er) return cb(er)

    var args = [
      'clone',
      '--mirror',
      cloneURL, cachedRemote
    ]
    git.whichAndExec(
      ['clone', '--mirror', cloneURL, cachedRemote],
      { cwd: cachedRemote, env: gitEnv() },
      function (er, stdout, stderr) {
        if (er) {
          var combined = (stdout + '\n' + stderr).trim()
          var command = 'git ' + args.join(' ') + ':'
          debug(command, combined)
          return cb(er)
        }
        debug('mirrorRemote', from, 'git clone ' + cloneURL, stdout.trim())
      }
    )
  })
}
