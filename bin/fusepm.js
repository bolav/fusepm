#!/usr/bin/env node

process.title = 'fusepm'
var program = require('commander');
var install = require('../lib/install');
var bump = require('../lib/bump');
var fixunoproj = require('../lib/fixunoproj');
var fusepm = require('../lib/fusepm');

program
  .version(require('../package.json').version)
  .option('-p, --unoproj [filename]', 'Specify .unoproj file')

program
  .command('install <module>')
  .description('install fuse module')
  .action(install);

program
  .command('bump <release>')
  .description('bump version')
  .action(bump);

program
  .command('fixunoproj')
  .description('fix the unoproj')
  .action(fixunoproj);

fusepm.set_commander(program);
program
  .parse(process.argv);

// program.help();
