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

- Fork/clone this repo
- `npm link`
- Use as outlined above

## Creating a library

The docs in [uno-projects](https://www.fusetools.com/docs/basics/uno-projects) mention the concept of Fuse libraries.

  "An Uno project can either be a library project consisting of assets and components for use in other projects, or an actual app project. The presence of an App class in the project indicates that the project is an app project."

The `fusepm` tool is a way to import Fuse libraries into your project using the following conventions.

A for a library to work with fusepm, it must have a `<xyz>_include.unoproj` file such as `sqlite_include.unoproj` in [fuse-sqlite](https://github.com/bolav/fuse-sqlite)

The library `<xyz>_include.unoproj` file can include one or more `.ux` files without an `<App>` tag. These tags (components) will be available in the App `.ux` file of the application project just like if they had been created there.
Libraries makes it easy to partition your app into smaller parts, such as a library per page or libraries for view components to be reused/shared across multiple apps.

## TODO

- Allow install of multiple modules in one command
- Allow install of a pre-defined collection of modules

