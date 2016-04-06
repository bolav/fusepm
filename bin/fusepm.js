#!/usr/bin/env node

process.title = 'fusepm'
var program = require('commander');
var install = require('../lib/install');
program
  .version(require('../package.json').version)

program
  .command('install <module>')
  .description('install fuse module')
  .action(install);

program
  .parse(process.argv);
