#!/usr/bin/env node

process.title = 'fusepm'
var program = require('commander');
var install = require('../lib/install');
var bump = require('../lib/bump');
var fixunoproj = require('../lib/fixunoproj');
var fusepm = require('../lib/fusepm');
var fpm_npm = require('../lib/npm');

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

program
  .command('npm <module...>')
  .description('make npm module(s) ready for fuse (experimental)')
  .option('--ignore-missing', 'Ignore missing depdencies for require')
  .action(fpm_npm);

program
  .command('*', null, { noHelp: 1 })
  .action(function () { program.help() })

fusepm.set_commander(program);
program
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}

