/**
 * @file ImportMap 引用对象映射
 * @author zongyu(liuxuanzy@qq.com)
 */

import * as t from 'babel-types'

export default class ImportMap {

    /**
     * 当前使用的引用映射
     *
     * @private
     * @type {ModuleMap}
     */
    map = null;

    /**
     * 所有的引用
     *
     * @private
     * @type {null}
     */
    imports = Object.create(null);

    /**
     * 构造函数
     *
     * @param {ModuleMap} map 当前使用的引用映射
     */
    constructor(map) {
        this.map = map;
    }

    /**
     * 添加一个引用
     *
     * @public
     * @param {Object} path 引用的路径
     */
    add(path) {

        // 取出import的模块，根据AMD特性，去掉结尾的.js
        let key = path.node.source.value.replace(/\.js$/, '');

        let {specifiers = [], maxBlockHoist = 0} = this.imports[key] || {};

        specifiers.push(...path.node.specifiers);
        maxBlockHoist = Math.max(path.node._blockHoist || 0, maxBlockHoist);
        this.imports[key] = {specifiers, maxBlockHoist};
        path.remove();
    }

    /**
     * 处理所有的引用
     *
     * @public
     * @return {Array}
     */
    process() {

        let nodes = [];
        let {imports, map} = this;

        // 处理所有的import
        for (let source in imports) {

            let {specifiers, maxBlockHoist} = imports[source];

            if (specifiers.length) {

                let wildcard;
                let hasDefault = false;

                // 第一个循环扫描所有的默认引用
                for (let i = 0; i < specifiers.length; i++) {

                    let specifier = specifiers[i];

                    if (t.isImportDefaultSpecifier(specifier)
                        || t.isImportNamespaceSpecifier(specifier)
                    ) {

                        wildcard = map.add(source, maxBlockHoist, specifier.local);
                        hasDefault = true;
                        break;
                    }
                }

                // 如果不存在默认引用，生成一个
                wildcard = wildcard || map.add(source, maxBlockHoist);

                // 如果存在默认引用，使用默认引用的名字作为变量

                for (let i = 0; i < specifiers.length; i++) {

                    let specifier = specifiers[i];

                    // `import * as foo from \'foo\'`和 `import foo from \'foo\'`的行为一致
                    if (t.isImportDefaultSpecifier(specifier)
                        || t.isImportNamespaceSpecifier(specifier)
                    ) {

                        // 对于重命名的变量，新建一个引用
                        if (specifier.local !== wildcard) {

                            let decl = t.variableDeclaration('var', [
                                t.variableDeclarator(specifier.local, wildcard)
                            ]);

                            nodes.push(decl);
                        }
                    }
                    else if (t.isImportSpecifier(specifier)) {

                        // AMD模块不存在滞后引用的问题，所以应当在变量一声明就进行赋值操作
                        let decl = t.variableDeclaration('var', [t.variableDeclarator(
                            specifier.local,
                            t.memberExpression(wildcard, t.cloneWithoutLoc(specifier.imported))
                        )]);

                        nodes.push(decl);
                    }
                }
            }
            else {
                map.add(source, maxBlockHoist, false);
            }
        }

        return nodes;
    }
}
 