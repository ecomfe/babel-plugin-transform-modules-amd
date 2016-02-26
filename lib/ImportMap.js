'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

var ImportMap = (function () {
    function ImportMap(map) {
        _classCallCheck(this, ImportMap);

        this.map = null;
        this.imports = Object.create(null);

        this.map = map;
    }

    _createClass(ImportMap, [{
        key: 'add',
        value: function add(path) {
            var key = path.node.source.value.replace(/\.js$/, '');

            var _ref = this.imports[key] || {};

            var _ref$specifiers = _ref.specifiers;
            var specifiers = _ref$specifiers === undefined ? [] : _ref$specifiers;
            var _ref$maxBlockHoist = _ref.maxBlockHoist;
            var maxBlockHoist = _ref$maxBlockHoist === undefined ? 0 : _ref$maxBlockHoist;

            specifiers.push.apply(specifiers, _toConsumableArray(path.node.specifiers));
            maxBlockHoist = Math.max(path.node._blockHoist || 0, maxBlockHoist);
            this.imports[key] = { specifiers: specifiers, maxBlockHoist: maxBlockHoist };
            path.remove();
        }
    }, {
        key: 'process',
        value: function process() {

            var nodes = [];
            var imports = this.imports;
            var map = this.map;

            for (var source in imports) {
                var _imports$source = imports[source];
                var specifiers = _imports$source.specifiers;
                var maxBlockHoist = _imports$source.maxBlockHoist;

                if (specifiers.length) {

                    var wildcard = undefined;
                    var hasDefault = false;

                    for (var i = 0; i < specifiers.length; i++) {

                        var specifier = specifiers[i];

                        if (t.isImportDefaultSpecifier(specifier) || t.isImportNamespaceSpecifier(specifier)) {

                            wildcard = map.add(source, maxBlockHoist, specifier.local);
                            hasDefault = true;
                            break;
                        }
                    }

                    wildcard = wildcard || map.add(source, maxBlockHoist);

                    for (var i = 0; i < specifiers.length; i++) {

                        var specifier = specifiers[i];

                        if (t.isImportDefaultSpecifier(specifier) || t.isImportNamespaceSpecifier(specifier)) {
                            if (specifier.local !== wildcard) {

                                var decl = t.variableDeclaration('var', [t.variableDeclarator(specifier.local, wildcard)]);

                                nodes.push(decl);
                            }
                        } else if (t.isImportSpecifier(specifier)) {
                            var decl = t.variableDeclaration('var', [t.variableDeclarator(specifier.local, t.memberExpression(wildcard, t.cloneWithoutLoc(specifier.imported)))]);

                            nodes.push(decl);
                        }
                    }
                } else {
                    map.add(source, maxBlockHoist, false);
                }
            }

            return nodes;
        }
    }]);

    return ImportMap;
})();

exports['default'] = ImportMap;
module.exports = exports['default'];