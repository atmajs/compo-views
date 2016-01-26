var ViewState = {
	NONE: 0,
	LOADING: 1,
	LOADED: 2,
	RENDERING: 3,
	RENDERED: 4
};

var ViewData = mask.class.create({
	viewNode: null,
	nodes: null,
	compo: null,
	route: null,
	state: ViewState.NONE,
	path: null,
	/*
	 * View is shown when no route is matched, otherwise everything viewManager decides
	 * whether to hide everything, or to show an error
	 */
	'default': false,
	constructor (...args) {
		var imax = args.length,
			i = -1;
		while (++i < imax) {
			var x = args[i];
			if (x == null) {
				continue;
			}
			mask.obj.extend(this, x);
		}
	},
	getNodes () {
		return this.viewNode || this.nodes || mask.parse(`import from '${this.path}'`);
	}
});


var ViewMap = {
	ensure (viewManager, model, ctx) {
		var viewmap = viewManager.viewmap;
		if (viewmap != null) {
			return viewmap;
		}
		var fn = mask.Utils.Expression.eval;
		viewmap = viewManager.scope.viewmap
			|| (viewManager.xViewmap && fn(viewManager.xViewmap, model, ctx, viewManager))
			|| {};
		mask
			.jmask(viewManager.nodes)
			.filter('View')
			.map(ViewMap.createViewDataFromNode)
			.each(x => {
				viewmap[x.route] = new ViewData(viewmap[x.route], x);
			});

		return (viewManager.viewmap = viewmap);
	},
	createRoutes (viewManager) {
		for(var key in viewManager.viewmap) {
			viewManager.routes.add(key, viewManager.viewmap[key]);
		}
	},
	createViewDataFromNode (viewNode) {
		return new ViewData({
			viewNode: viewNode,
			route: viewNode.attr.route,
			path: viewNode.attr.path,
			'default': Boolean(viewNode.attr['default']),
		});
	},
	getRouteByPath (viewManager, path) {
		var routes = viewManager.routes,
			route = routes.get(path);
		if (route) {
			return route;
		}
		var viewmap = viewManager.viewmap;
		for(var key in viewmap) {
			if (viewmap[key]['default'] === true) {
				return routes.get(key);
			}
		}
		return null;
	},
	bindRouter (viewManager, model, ctx) {
		var viewmap = ViewMap.ensure(viewManager, model, ctx);
		if (viewmap == null) {
			console.error('Viewmap is undefined');
			return;
		}
		for(var key in viewmap) {
			ruta.add(key, route => {
				viewManager.navigate(route.current.path);
			});
		}
	}
}
