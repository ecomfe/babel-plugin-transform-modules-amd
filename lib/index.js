'use strict';

var _ModuleMap = require('./ModuleMap');

var _ModuleMap2 = _interopRequireDefault(_ModuleMap);

var _ImportMap = require('./ImportMap');

var _ImportMap2 = _interopRequireDefault(_ImportMap);

var _ExportMap = require('./ExportMap');

var _ExportMap2 = _interopRequireDefault(_ExportMap);

var _babelTemplate = require('babel-template');

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @file index 将部分ES6模块翻译成AMD模块
 * @author zongyu(liuxuanzy@qq.com)
 */

let buildFactory = (0, _babelTemplate2.default)(`
  define(function (PARAMS) {
      BODY;
  });
`);

module.exports = function (_ref) {
    let t = _ref.types;


    return {

        visitor: {

            Program: {

                exit(path) {

                    let map = new _ModuleMap2.default(path.scope);
                    let imports = new _ImportMap2.default(map);
                    let exports = new _ExportMap2.default(map);

                    // 取出所有的顶级表达式
                    path.get('body').forEach(path => {
                        if (path.isImportDeclaration()) {
                            imports.add(path);
                        }
                        if (path.isExportNamedDeclaration() || path.isExportDefaultDeclaration() || path.isExportAllDeclaration()) {
                            exports.add(path);
                        }
                    });

                    // 处理所有的添加节点
                    let importNodes = imports.process();
                    let exportNodes = exports.process();
                    let requireNodes = map.instance();
                    let exportReturn = exports.returnStament();

                    let node = path.node;
                    let params = [];

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