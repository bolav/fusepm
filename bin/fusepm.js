#!/usr/bin/env node

process.title = 'fusepm'
var program = require('commander');
var install = require('../lib/install');
var bump = require('../lib/bump');
var fusepm = require('../lib/utils');

program
  .version(require('../package.json').version)

program
  .command('install <module>')
  .description('install fuse module')
  .action(install);

program
  .command('bump <release>')
  .description('bump version')
  .action(bump);


fusepm.verify_local_unoproj(".");

program
  .parse(process.argv);

// program.help();
