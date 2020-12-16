/*!
 * Form Component v%IMPORT(version)%
 * Part of the Atma.js Project
 * http://atmajs.com/
 *
 * MIT license
 * http://opensource.org/licenses/MIT
 *
 * (c) 2012, %IMPORT(year)% Atma.js and other contributors
 */
(function(root, factory){
    var _global = typeof global !== 'undefined' ? global : window,
        _mask = resolve('mask', 'maskjs'),
        _ruta = resolve('ruta', 'ruta'),
        _module = {
            exports: {}
        }

    function resolve(property, npm) {
        var lib = _global[property] || (_global.atma && _global.atma[property]);
        if (lib != null) {
            return lib;
        }
        if (typeof require === 'function') {
            return require(npm);
        }
        throw Error(property + ' was not loaded');
    }

    factory(
        _global,
        _mask,
        _mask.Compo.config.getDOMLibrary(),
        _ruta,
        _module,
        _module.exports,
    );
}(this, function(global, mask, $, ruta, module, exports){

    'use strict';

    /**MODULE**/

}));
