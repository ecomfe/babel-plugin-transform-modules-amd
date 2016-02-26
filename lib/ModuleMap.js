'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _path = require('path');

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

var _babelTemplate = require('babel-template');

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

var buildRequire = (0, _babelTemplate2['default'])('require($0);');

var ModuleMap = (function () {
    function ModuleMap(scope) {
        _classCallCheck(this, ModuleMap);

        this.scope = null;
        this.requires = Object.create(null);
        this.imports = Object.create(null);

        scope.rename('require');
        scope.rename('exports');

        this.scope = scope;
    }

    _createClass(ModuleMap, [{
        key: 'add',
        value: function add(source) {
            var blockHoist = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
            var indentifier = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
            var scope = this.scope;
            var imports = this.imports;
            var requires = this.requires;

            var cached = imports[source];

            if (cached) {
                return cached;
            }

            var req = requires[source] = requires[source] || buildRequire(t.stringLiteral(source));

            if (indentifier === false) {
                req._blockHoist = blockHoist;
                return this.imports[source] = null;
            }

            var name = (0, _path.basename)(source, (0, _path.extname)(source));
            var ref = indentifier || scope.generateUidIdentifier(name);

            var varDecl = t.variableDeclaration('var', [t.variableDeclarator(ref, req.expression)]);

            varDecl._blockHoist = blockHoist;

            requires[source] = varDecl;

            return imports[source] = ref;
        }
    }, {
        key: 'instance',
        value: function instance() {

            var nodes = [];

            for (var source in this.requires) {
                nodes.push(this.requires[source]);
            }

            return nodes;
        }
    }]);

    return ModuleMap;
})();

exports['default'] = ModuleMap;
module.exports = exports['default'];