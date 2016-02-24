'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ImportMap {

    /**
     * 构造函数
     *
     * @param {ModuleMap} map 当前使用的引用映射
     */


    /**
     * 当前使用的引用映射
     *
     * @private
     * @type {ModuleMap}
     */
    constructor(map) {
        this.map = null;
        this.imports = Object.create(null);

        this.map = map;
    }

    /**
     * 添加一个引用
     *
     * @public
     * @param {Object} path 引用的路径
     */


    /**
     * 所有的引用
     *
     * @private
     * @type {null}
     */
    add(path) {

        // 取出import的模块，根据AMD特性，去掉结尾的.js
        let key = path.node.source.value.replace(/\.js$/, '');

        var _ref = this.imports[key] || {};

        var _ref$specifiers = _ref.specifiers;
        let specifiers = _ref$specifiers === undefined ? [] : _ref$specifiers;
        var _ref$maxBlockHoist = _ref.maxBlockHoist;
        let maxBlockHoist = _ref$maxBlockHoist === undefined ? 0 : _ref$maxBlockHoist;


        specifiers.push.apply(specifiers, (0, _toConsumableArray3.default)(path.node.specifiers));
        maxBlockHoist = Math.max(path.node._blockHoist || 0, maxBlockHoist);
        this.imports[key] = { specifiers, maxBlockHoist };
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
        let imports = this.imports;
        let map = this.map;

        // 处理所有的import

        for (let source in imports) {
            var _imports$source = imports[source];
            let specifiers = _imports$source.specifiers;
            let maxBlockHoist = _imports$source.maxBlockHoist;


            if (specifiers.length) {

                let wildcard;
                let hasDefault = false;

                // 第一个循环扫描所有的默认引用
                for (let i = 0; i < specifiers.length; i++) {

                    let specifier = specifiers[i];

                    if (t.isImportDefaultSpecifier(specifier) || t.isImportNamespaceSpecifier(specifier)) {

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
                    if (t.isImportDefaultSpecifier(specifier) || t.isImportNamespaceSpecifier(specifier)) {

                        // 对于重命名的变量，新建一个引用
                        if (specifier.local !== wildcard) {

                            let decl = t.variableDeclaration('var', [t.variableDeclarator(specifier.local, wildcard)]);

                            nodes.push(decl);
                        }
                    } else if (t.isImportSpecifier(specifier)) {

                        // AMD模块不存在滞后引用的问题，所以应当在变量一声明就进行赋值操作
                        let decl = t.variableDeclaration('var', [t.variableDeclarator(specifier.local, t.memberExpression(wildcard, t.cloneWithoutLoc(specifier.imported)))]);

                        nodes.push(decl);
                    }
                }
            } else {
                map.add(source, maxBlockHoist, false);
            }
        }

        return nodes;
    }
}
exports.default = ImportMap; /**
                              * @file ImportMap 引用对象映射
                              * @author zongyu(liuxuanzy@qq.com)
                              */