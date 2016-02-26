'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ModuleMap = require('./ModuleMap');

var _ModuleMap2 = _interopRequireDefault(_ModuleMap);

var _ImportMap = require('./ImportMap');

var _ImportMap2 = _interopRequireDefault(_ImportMap);

var _ExportMap = require('./ExportMap');

var _ExportMap2 = _interopRequireDefault(_ExportMap);

var _babelTemplate = require('babel-template');

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

var buildFactory = (0, _babelTemplate2['default'])('\n  define(function (PARAMS) {\n      BODY;\n  });\n');

module.exports = function (_ref) {
    var t = _ref.types;

    return {
        inherits: require("babel-plugin-syntax-export-extensions"),

        visitor: {

            Program: {

                exit: function exit(path) {

                    var map = new _ModuleMap2['default'](path.scope);
                    var imports = new _ImportMap2['default'](map);
                    var exports = new _ExportMap2['default'](map);

                    path.get('body').forEach(function (path) {
                        if (path.isImportDeclaration()) {
                            imports.add(path);
                        }
                        if (path.isExportNamedDeclaration() || path.isExportDefaultDeclaration() || path.isExportAllDeclaration()) {
                            exports.add(path);
                        }
                    });

                    var importNodes = imports.process();
                    var exportNodes = exports.process();
                    var requireNodes = map.instance();
                    var exportReturn = exports.returnStament();

                    var node = path.node;
                    var params = [];

                    if (requireNodes.length) {
                        params.push(t.identifier('require'));
                    }

                    node.body = [buildFactory({
                        PARAMS: params,
                        BODY: [].concat(requireNodes, importNodes, exportNodes, node.body, exportReturn)
                    })];
                }
            }
        }
    };
};