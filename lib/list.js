var debug = require('debug')('fusepm-install');

module.exports = list;

function list (cmd, options) {
  /*
  var ready = new Promise(function (resolve, reject) {
  });*/
  debug('list');
  debug(cmd);
  var repo = require('../repository');
  var keys = Object.keys(repo).join('\n');
  console.log("Registered fuse modules:");
  console.log("========================");

  console.log(keys);
}
