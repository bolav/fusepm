fusepm - A [Fusetools](http://www.fusetools.com/) package manager 
=================================================================

[![Build Status](https://travis-ci.org/bolav/fusepm.svg?branch=master)](https://travis-ci.org/bolav/fusepm)
[![NPM Version](https://img.shields.io/npm/v/fusepm.svg)](https://www.npmjs.com/package/fusepm)

## Installation

    $ npm install -g fusepm

## Usage

     Usage: fusepm [options] [command]


     Commands:

       install <module>  install fuse module
       list              modules in registry
       bump <release>    bump version
       fixunoproj        fix the unoproj
       npm <module...>   make npm module(s) ready for fuse (experimental)

     Options:

       -h, --help                output usage information
       -V, --version             output the version number
       -p, --unoproj [filename]  Specify .unoproj file

## CLI usage examples

### List modules in registry

```bash
$ fusepm list
Registered fuse modules:
========================
datepicker
barcodescanner
cachingimagesource
camerapanel
contacts
dropbox
emacs
facebook-login
gallery
onetimepassword
qreader
...
```

### Install registered module

`fusepm install gallery`

## Updating module registry
Update the module registry with additional official/community modules in `/registry/index.js`. Make sure it always exports an Object where the keys are the names of each module and the value the URI for where to fetch and clone the files.

```js
module.exports = {
  "datepicker": "https://github.com/bolav/fuse-datepicker",
  // ...
}
```

## Local use and debug/development

- Fork this repo
- `npm link`
- Use as above

## TODO

- Allow install of multiple modules in one command
- Allow install of a pre-defined collection of modules

