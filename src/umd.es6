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
		_ruta = resolve('ruta', 'ruta');


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
		_mask.jmask,
		_mask.Compo,
		_mask.Compo.config.getDOMLibrary(),
		_ruta
	);
}(this, function(global, mask, j, Compo, $, ruta){

	// import utils/path.es6

	// import class/ViewData.es6
	// import class/ViewMap.es6

	// import class/ActivityTracker.es6
	// import class/ViewChanger.es6

	// import compo/ViewManager.es6
	mask.registerHandler('ViewManager', ViewManagerCompo);
}));
