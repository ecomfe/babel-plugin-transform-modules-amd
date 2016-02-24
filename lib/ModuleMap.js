'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

var _babelTemplate = require('babel-template');

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

let buildRequire = (0, _babelTemplate2.default)(`require($0);`);

/**
 * 模块引用处理
 *
 * @class ModuleMap
 */
/**
 * @file ModuleMap 用于处理模块引用，保证代码在同一个模块中，只引用一次
 * @author zongyu(liuxuanzy@qq.com)
 */

class ModuleMap {

    /**
     * 构造函数
     *
     * @param {Object} scope 当前使用的作用域
     */


    /**
     * 模块引用表
     *
     * @private
     * @type {Object}
     */
    constructor(scope) {
        this.scope = null;
        this.requires = Object.create(null);
        this.imports = Object.create(null);


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


    /**
     * 模块引用接口表
     *
     * @private
     * @type {Object}
     */


    /**
     * 当前使用的作用域
     *
     * @public
     * @type {Object}
     */
    add(source) {
        let blockHoist = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
        let indentifier = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
        let scope = this.scope;
        let imports = this.imports;
        let requires = this.requires;

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

        let name = (0, _path.basename)(source, (0, _path.extname)(source));
        let ref = indentifier || scope.generateUidIdentifier(name);

        let varDecl = t.variableDeclaration('var', [t.variableDeclarator(ref, req.expression)]);

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
exports.default = ModuleMap;