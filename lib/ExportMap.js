'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

var _babelTemplate = require('babel-template');

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * @file ExportMap 导出管理类
 * @author zongyu(liuxuanzy@qq.com)
 */

let buildExportsAssignment = (0, _babelTemplate2.default)(`exports.$0 = $1;`);

let buildExportExpression = (0, _babelTemplate2.default)(`var exports = {};`);

let buildExportsAllAssignment = (0, _babelTemplate2.default)(`
    for (let KEY in OBJECT) {
        if(Object.prototype.hasOwnProperty.call(OBJECT, KEY)) {
            exports[KEY] = OBJECT[KEY];
        }
    }
`);

class ExportMap {

    /**
     * 构造函数
     *
     * @param {ModuleMap} map 当前使用的引用映射
     */


    /**
     * 是否需要添加命名导出
     *
     * @private
     * @type {boolean}
     */


    /**
     * 所有要导出的元素数组
     *
     * @private
     * @type {Array}
     */
    constructor(map) {
        this.map = null;
        this.exports = [];
        this.nodes = [];
        this.hasNamedExport = false;
        this.lastDefaultExportIdentifier = null;

        this.map = map;
    }

    /**
     * 添加一个导出
     *
     * @public
     * @param {Object} path 引用的路径
     */


    /**
     * 最后一个默认导出的变量
     *
     * @private
     * @type {Object}
     */


    /**
     * 要添加到头部的语句
     *
     * @private
     * @type {Array}
     */


    /**
     * 当前使用的引用映射
     *
     * @private
     * @type {ModuleMap}
     */
    add(path) {
        this.exports.push(path);
    }

    /**
     * 处理所有的导出
     *
     * @public
     * @return {Array}
     */
    process() {

        for (var i = 0; i < this.exports.length; i++) {

            let path = this.exports[i];

            if (path.isExportDefaultDeclaration()) {

                // 默认导出和命名导出不应当公用
                if (this.hasNamedExport) {
                    throw new TypeError('amd module don\'t support `export default foo` and , `export foo`' + 'both, please choose one');
                }

                this.processExportDefaultDeclaration(path);
                continue;
            }

            // 默认导出和命名导出不应当公用
            if (this.lastDefaultExportIdentifier) {
                throw new TypeError('amd module don\'t support `export default foo` and , `export foo`' + 'both, please choose one');
            }

            this.processExportNamedDeclaration(path);

            this.hasNamedExport = true;

            if (path.isExportNamedDeclaration()) {
                this.processExportNamedDeclaration(path);
            } else if (path.isExportAllDeclaration()) {
                this.processExportAllDeclaration(path);
            }
        }

        if (this.hasNamedExport) {
            this.nodes.unshift(buildExportExpression());
        }

        return this.nodes;
    }

    /**
     * 处理一个默认导出
     *
     * @private
     * @param {Object} path 引用的路径
     */
    processExportDefaultDeclaration(path) {

        let scope = this.map.scope;

        // 获取属性定义
        let declaration = path.get('declaration');

        if (declaration.isFunctionDeclaration()) {

            let id = declaration.node.id;

            if (id) {
                path.replaceWith(declaration.node);
                this.lastDefaultExportIdentifier = id;
            } else {
                let ref = scope.generateUidIdentifier('fn');
                path.replaceWith(t.variableDeclaration('var', [t.variableDeclarator(ref, t.toExpression(declaration.node))]));
                this.lastDefaultExportIdentifier = ref;
            }
        } else if (declaration.isClassDeclaration()) {

            let id = declaration.node.id;

            if (id) {
                path.replaceWith(declaration.node);
                this.lastDefaultExportIdentifier = id;
            } else {
                let ref = scope.generateUidIdentifier('class');
                path.replaceWith(t.variableDeclaration('var', [t.variableDeclarator(ref, t.toExpression(declaration.node))]));
                this.lastDefaultExportIdentifier = ref;
            }
        } else {

            let ref = scope.generateUidIdentifier('var');
            path.replaceWith(t.variableDeclaration('var', [t.variableDeclarator(ref, declaration.node)]));
            this.lastDefaultExportIdentifier = ref;
        }
    }

    /**
     * 处理一个名称导出
     *
     * @private
     * @param {Object} path 引用的路径
     */
    processExportNamedDeclaration(path) {

        let declaration = path.get('declaration');

        // 处理变量定义类型
        if (declaration.node) {

            if (declaration.isFunctionDeclaration()) {

                let id = declaration.node.id;

                path.replaceWithMultiple([declaration.node, buildExportsAssignment(id, id)]);
            } else if (declaration.isClassDeclaration()) {

                let id = declaration.node.id;

                path.replaceWithMultiple([declaration.node, buildExportsAssignment(id, id)]);
            } else if (declaration.isVariableDeclaration()) {

                let declarators = declaration.get('declarations');

                for (let i = 0; i < declarators.length; i++) {
                    let decl = declarators[i];
                    let id = decl.get('id');

                    let init = decl.get('init');

                    if (!init.node) {
                        init.replaceWith(t.identifier('undefined'));
                    }

                    init.replaceWith(buildExportsAssignment(id.node, init.node).expression);
                }

                path.replaceWith(declaration.node);
            }

            return;
        }

        let specifiers = path.get('specifiers');
        let map = this.map;

        if (specifiers.length) {

            let nodes = [];
            let source = path.node.source;

            if (source) {

                let ref = map.add(source.value, path.node._blockHoist);

                for (let i = 0; i < specifiers.length; i++) {
                    let specifier = specifiers[i];

                    let local = specifier.node.local;

                    if (specifier.isExportNamespaceSpecifier()) {
                        nodes.push(buildExportsAssignment(local, ref));
                    } else if (specifier.isExportDefaultSpecifier()) {
                        nodes.push(buildExportsAssignment(local, ref));
                    } else if (specifier.isExportSpecifier()) {
                        nodes.push(buildExportsAssignment(local, t.memberExpression(ref, local)));
                    }
                }
            } else {

                for (let i = 0; i < specifiers.length; i++) {
                    let specifier = specifiers[i];

                    if (specifier.isExportSpecifier()) {
                        nodes.push(buildExportsAssignment(specifier.node.exported, specifier.node.local));
                    }
                }
            }

            path.replaceWithMultiple(nodes);
        }
    }

    /**
     * 处理一个全局导出
     *
     * @private
     * @param {Object} path 引用的路径
     */
    processExportAllDeclaration(path) {

        let ref = this.map.add(path.node.source.value, path.node._blockHoist);

        path.replaceWith(buildExportsAllAssignment({
            OBJECT: ref,
            KEY: this.map.scope.generateUidIdentifier('key')
        }));
    }

    /**
     * 获取返回值语句
     *
     * @return {Array}
     */
    returnStament() {

        if (this.lastDefaultExportIdentifier) {
            return [t.returnStatement(this.lastDefaultExportIdentifier)];
        }

        if (this.hasNamedExport) {
            return [t.returnStatement(t.identifier('exports'))];
        }

        return [];
    }
}
exports.default = ExportMap;