/**
 * @file ModuleMap 用于处理模块引用，保证代码在同一个模块中，只引用一次
 * @author zongyu(liuxuanzy@qq.com)
 */

import { basename, extname } from 'path';
import * as t from 'babel-types'
import template from 'babel-template';

let buildRequire = template(`require($0);`);

/**
 * 模块引用处理
 *
 * @class ModuleMap
 */
export default class ModuleMap {

    /**
     * 当前使用的作用域
     *
     * @public
     * @type {Object}
     */
    scope = null;

    /**
     * 模块引用表
     *
     * @private
     * @type {Object}
     */
    requires = Object.create(null);

    /**
     * 模块引用接口表
     *
     * @private
     * @type {Object}
     */
    imports = Object.create(null);

    /**
     * 构造函数
     *
     * @param {Object} scope 当前使用的作用域
     */
    constructor(scope) {

        // 将AMD用到的require变量和模块定义用到的exports变量进行重命名
        scope.rename('require');
        scope.rename('exports');

        this.scope = scope;
    }

    /**
     * 添加一个模块引入
     *
     * @param {string} source 模块名
     * @param {number} blockHoist 模块提升级别
     * @param {Object|boolean} indentifier 模块标识，如果为`false`，则不生成标识
     * @return {Object} 返回模块标识
     */
    add(source, blockHoist = 0, indentifier = null) {

        let {scope, imports, requires} = this;
        let cached = imports[source];

        if (cached) {
            return cached;
        }

        let req = requires[source] = requires[source] || buildRequire(t.stringLiteral(source));

        // 确保添加了引用的key，以方便import 'foo' 这种写法
        if (indentifier === false) {
            req._blockHoist = blockHoist;
            return this.imports[source] = null;
        }

        let name = basename(source, extname(source));
        let ref = indentifier || scope.generateUidIdentifier(name);

        let varDecl = t.variableDeclaration('var', [
            t.variableDeclarator(
                ref,
                req.expression
            )
        ]);

        varDecl._blockHoist = blockHoist;

        requires[source] = varDecl;

        return imports[source] = ref;
    }

    /**
     * 获取全部的模块引入
     *
     * @public
     */
    instance() {

        let nodes = [];

        for (let source in this.requires) {
            nodes.push(this.requires[source]);
        }

        return nodes;
    }
}