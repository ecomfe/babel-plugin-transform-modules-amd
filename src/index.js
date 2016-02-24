/**
 * @file index 将部分ES6模块翻译成AMD模块
 * @author zongyu(liuxuanzy@qq.com)
 */

import ModuleMap from './ModuleMap'
import ImportMap from './ImportMap'
import ExportMap from './ExportMap'
import template from 'babel-template'

let buildFactory = template(`
  define(function (PARAMS) {
      BODY;
  });
`);

module.exports = function ({types: t}) {

    return {

        visitor: {

            Program: {

                exit(path) {

                    let map = new ModuleMap(path.scope);
                    let imports = new ImportMap(map);
                    let exports = new ExportMap(map);

                    // 取出所有的顶级表达式
                    path.get('body').forEach(path => {
                        if (path.isImportDeclaration()) {
                            imports.add(path);
                        }
                        if (path.isExportNamedDeclaration()
                            || path.isExportDefaultDeclaration()
                            || path.isExportAllDeclaration()
                        ) {
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

                    node.body = [
                        buildFactory({
                            PARAMS: params,
                            BODY: [].concat(
                                requireNodes,
                                importNodes,
                                exportNodes,
                                node.body,
                                exportReturn
                            )
                        })
                    ];
                }
            }
        }
    }
};