'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

var _babelTemplate = require('babel-template');

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

var buildExportsAssignment = (0, _babelTemplate2['default'])('exports.$0 = $1;');

var buildExportExpression = (0, _babelTemplate2['default'])('var exports = {};');

var buildExportsAllAssignment = (0, _babelTemplate2['default'])('\n    for (let KEY in OBJECT) {\n        if(Object.prototype.hasOwnProperty.call(OBJECT, KEY)) {\n            exports[KEY] = OBJECT[KEY];\n        }\n    }\n');

var ExportMap = (function () {
    function ExportMap(map) {
        _classCallCheck(this, ExportMap);

        this.map = null;
        this.exports = [];
        this.nodes = [];
        this.hasNamedExport = false;
        this.lastDefaultExportIdentifier = null;

        this.map = map;
    }

    _createClass(ExportMap, [{
        key: 'add',
        value: function add(path) {
            this.exports.push(path);
        }
    }, {
        key: 'process',
        value: function process() {

            for (var i = 0; i < this.exports.length; i++) {

                var path = this.exports[i];

                if (path.isExportDefaultDeclaration()) {
                    if (this.hasNamedExport) {
                        throw new TypeError('amd module don\'t support `export default foo` and , `export foo`' + 'both, please choose one');
                    }

                    this.processExportDefaultDeclaration(path);
                    continue;
                }

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
    }, {
        key: 'processExportDefaultDeclaration',
        value: function processExportDefaultDeclaration(path) {

            var scope = this.map.scope;

            var declaration = path.get('declaration');

            if (declaration.isFunctionDeclaration()) {

                var id = declaration.node.id;

                if (id) {
                    path.replaceWith(declaration.node);
                    this.lastDefaultExportIdentifier = id;
                } else {
                    var ref = scope.generateUidIdentifier('fn');
                    path.replaceWith(t.variableDeclaration('var', [t.variableDeclarator(ref, t.toExpression(declaration.node))]));
                    this.lastDefaultExportIdentifier = ref;
                }
            } else if (declaration.isClassDeclaration()) {

                var id = declaration.node.id;

                if (id) {
                    path.replaceWith(declaration.node);
                    this.lastDefaultExportIdentifier = id;
                } else {
                    var ref = scope.generateUidIdentifier('class');
                    path.replaceWith(t.variableDeclaration('var', [t.variableDeclarator(ref, t.toExpression(declaration.node))]));
                    this.lastDefaultExportIdentifier = ref;
                }
            } else {

                if (t.isIdentifier(declaration.node)) {
                    this.lastDefaultExportIdentifier = declaration.node;
                    path.remove();
                } else {
                    var ref = scope.generateUidIdentifier('var');
                    path.replaceWith(t.variableDeclaration('var', [t.variableDeclarator(ref, declaration.node)]));
                    this.lastDefaultExportIdentifier = ref;
                }
            }
        }
    }, {
        key: 'processExportNamedDeclaration',
        value: function processExportNamedDeclaration(path) {

            var declaration = path.get('declaration');

            if (declaration.node) {

                if (declaration.isFunctionDeclaration()) {

                    var id = declaration.node.id;

                    path.replaceWithMultiple([declaration.node, buildExportsAssignment(id, id)]);
                } else if (declaration.isClassDeclaration()) {

                    var id = declaration.node.id;

                    path.replaceWithMultiple([declaration.node, buildExportsAssignment(id, id)]);
                } else if (declaration.isVariableDeclaration()) {

                    var declarators = declaration.get('declarations');

                    for (var i = 0; i < declarators.length; i++) {
                        var decl = declarators[i];
                        var id = decl.get('id');

                        var init = decl.get('init');

                        if (!init.node) {
                            init.replaceWith(t.identifier('undefined'));
                        }

                        init.replaceWith(buildExportsAssignment(id.node, init.node).expression);
                    }

                    path.replaceWith(declaration.node);
                }

                return;
            }

            var specifiers = path.get('specifiers');
            var map = this.map;

            if (specifiers.length) {

                var nodes = [];
                var source = path.node.source;

                if (source) {

                    var ref = map.add(source.value, path.node._blockHoist);

                    for (var i = 0; i < specifiers.length; i++) {

                        var specifier = specifiers[i];

                        var local = specifier.node.local;

                        if (specifier.isExportNamespaceSpecifier()) {
                            nodes.push(buildExportsAssignment(local, ref));
                        } else if (specifier.isExportDefaultSpecifier()) {
                            nodes.push(buildExportsAssignment(local, ref));
                        } else if (specifier.isExportSpecifier()) {

                            var exported = specifier.node.exported;

                            if (local.name !== 'default') {
                                nodes.push(buildExportsAssignment(exported, t.memberExpression(ref, local)));
                            } else {
                                nodes.push(buildExportsAssignment(exported, ref));
                            }
                        }
                    }
                } else {

                    for (var i = 0; i < specifiers.length; i++) {
                        var specifier = specifiers[i];

                        if (specifier.isExportSpecifier()) {
                            nodes.push(buildExportsAssignment(specifier.node.exported, specifier.node.local));
                        }
                    }
                }

                path.replaceWithMultiple(nodes);
            }
        }
    }, {
        key: 'processExportAllDeclaration',
        value: function processExportAllDeclaration(path) {

            var ref = this.map.add(path.node.source.value, path.node._blockHoist);

            path.replaceWith(buildExportsAllAssignment({
                OBJECT: ref,
                KEY: this.map.scope.generateUidIdentifier('key')
            }));
        }
    }, {
        key: 'returnStament',
        value: function returnStament() {

            if (this.lastDefaultExportIdentifier) {
                return [t.returnStatement(this.lastDefaultExportIdentifier)];
            }

            if (this.hasNamedExport) {
                return [t.returnStatement(t.identifier('exports'))];
            }

            return [];
        }
    }]);

    return ExportMap;
})();

exports['default'] = ExportMap;
module.exports = exports['default'];