"use strict";

var _interopRequireWildcard = require("babel-runtime/helpers/interop-require-wildcard")["default"];
var _babelTypes = require("babel-types");
var t = _interopRequireWildcard(_babelTypes);
var each = require("lodash/each");
var ids = require("../../../lib/fpm_npm/ids");
var path_module = require('path');
var debug = require('debug')('babel-fuse');

exports.__esModule = true;

exports["default"] = function () {
  return {
    visitor: {
      MemberExpression: function MemberExpression (path, file) {
        var name = path.node.object.name;
        if (watch_variables.hasOwnProperty(name)) {
          watch_variables[name].seen++;
        }
      },
      Identifier: function Identifier (path, file) {
        var name = path.node.name;
        if (path.parent.type === "MemberExpression") return;
        if (watch_variables.hasOwnProperty(name)) {
          watch_variables[name].seen++;
          if (path.parent.type === "VariableDeclarator") {
            // This is has a bug now, since we need to check that this is the first one (and not part of an assignment)
            watch_variables[name].declared++;
          }
        }
      },
      FunctionDeclaration: function FunctionDeclaration (path, file, c) {
        var name = path.node.id.name;
        if (watch_variables.hasOwnProperty(name)) {
          watch_variables[name].declared++;
        }
      },
      Program: { 
        enter: function ProgramEnter (path, file) {
          init_watch();
        },
        exit: function ProgramExit (path, file) {
          var topNodes = [];
          each(watch_variables, function (val, key) {
            if (val.seen && !val.declared) {
              ids.shim_used(key);
              debug("Creating shim for " + key);
              debug(path_module.basename(file.file.opts.filename));
              topNodes.push(val.declaration);
            }
          });
          path.unshiftContainer("body", topNodes);
        }
      },
      CallExpression: function CallExpression (path, file) {
        if (path.node.callee.name === "require") {
          var req = path.node.arguments[0].value;
          var rewrite = ids.get_require(req);
          if (rewrite != undefined) {
            path.node.arguments[0].value = rewrite;
          }
          else {
            // console.log("require not found! " + req);
          }

        }
      }
    }
  };
};

function init_watch () {
  watch_variables = {
    "global"    : { 
      "watch" : 1, "seen" : 0, "declared" : 0, 
      "declaration" : t.variableDeclaration("var", [t.variableDeclarator(t.identifier("global"), t.identifier("this"))])
    },
    "navigator" : { 
      "watch" : 1, "seen" : 0, "declared" : 0,
      "declaration" : t.variableDeclaration("var",
        [
          t.variableDeclarator(
            t.identifier("navigator"),
            t.objectExpression([t.objectProperty(t.stringLiteral("userAgent"), t.stringLiteral("FuseJS"))])
          )
        ])

    },
    "document"  : { 
      "watch" : 1, "seen" : 0, "declared" : 0,
      "declaration" : t.variableDeclaration("var", [t.variableDeclarator(t.identifier("document"))])
    },
    "window"  : { 
      "watch" : 1, "seen" : 0, "declared" : 0,
      "declaration" : t.variableDeclaration("var", [t.variableDeclarator(t.identifier("window"))])
    },
/*
Not working now, på grunn av manglende require
    "Buffer" : {
      "watch" : 1, "seen" : 0, "declared" : 0,
      "declaration" : 
          t.variableDeclaration("var", 
              [
                t.variableDeclarator(
                  t.identifier("Buffer"), 
                  t.memberExpression(
                    t.callExpression(t.identifier("require"),[t.stringLiteral("buffer")]),
                    t.identifier("Buffer")
                  )
                )
              ])
    }
*/
  };
}

var watch_variables = {};

module.exports = exports["default"];
// console.log(t.TYPES);