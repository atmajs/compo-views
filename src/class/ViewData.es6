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
	 * View is shown when no route is matched, otherwise viewManager decides
	 * whether to hide everything, or to show an error
	 */
	default: false,
	constructor (...args) {
		var imax = args.length,
			i = -1;
		while (++i < imax) {
			var x = args[i];
			if (x == null) {
				continue;
			}
			mask.obj.extend(this, x);
			if (x.view != null && this.path == null) {
				this.path = x.view;
			}
		}
	},
	getNodes () {
		if (this.viewNode != null) {
			if (this.path != null && this.viewNode.nodes == null) {
				//this.viewNode.nodes = mask.parse(`import from '${this.path}'`);
			}
			return this.viewNode;
		}
		if (this.nodes == null && this.path != null) {
			return (this.nodes = mask.parse(`import from '${this.path}'`));
		}
		return this.nodes;
	},
	toJSON () {
		return {
			route: this.route,
			state: this.state,
			path: this.path,
			viewNode: this.viewNode ? mask.stringify(this.viewNode) : null,
			nodes: this.nodes ? mask.stringify(this.nodes) : null,
		};
	},
	createViewNode (nodes) {
		var $ = j(nodes);

		if (this.hasView_($) === false) {
			var container = this.viewNode || j('View');
			this.viewNode = j(container).append(nodes);
			return;
		}
		this.viewNode = $[0];
	},
	hasView_ ($nodes) {
		if ($nodes.length !== 1) {
			return false;
		}
		// Any Component supposed to be an IView
		var name = $nodes.tag();
		if (name[0] === name[0].toUpperCase()) {
			return true;
		}
		return false;
	}
});

var ViewMap = mask.class.create({
	toJSON () {
		var json = {}, key, val;
		for(key in this) {
			val = this[key];
			if (val == null || mask.is.Function(val) || val.toJSON == null) {
				continue;
			}
			json[key] = val.toJSON();
		}
		return json;
	}
});



ViewMap.ensure = function (viewManager, model, ctx) {
		var viewmap = viewManager.viewmap;
		if (viewmap != null) {
			return viewmap;
		}
		var fn = mask.Utils.Expression.eval;
		var viewmap = new ViewMap;
		var scoped = viewManager.scope.viewmap
			|| (viewManager.xViewmap && fn(viewManager.xViewmap, model, ctx, viewManager));

		if (mask.is.Array(scoped)) {
			var arr = scoped;
			arr
				.map(ViewMap.createViewDataFromObj)
				.forEach(x => {
					viewmap[x.route] = new ViewData(viewmap[x.route], x);
				});
		}
		else if (mask.is.Object(scoped)) {
			var obj = scoped;
			for (var key in obj) {
				var entry = obj[key];
				if (entry.route == null) {
					entry.route = key;
				}
				viewmap[entry.route] = ViewMap.createViewDataFromObj(entry);
			}
		}
		mask
			.jmask(viewManager.nodes)
			.filter('View')
			.map(ViewMap.createViewDataFromNode)
			.each(x => {
				viewmap[x.route] = new ViewData(viewmap[x.route], x);
			});

		return (viewManager.viewmap = viewmap);
	};
ViewMap.createRoutes = function (viewManager) {
		for(var key in viewManager.viewmap) {
			viewManager.routes.add(key, viewManager.viewmap[key]);
		}
	};
ViewMap.createViewDataFromNode = function (viewNode) {
		var data = new ViewData({
			viewNode: viewNode,
			route: viewNode.attr.route,
			path: viewNode.attr.path,
			'default': Boolean(viewNode.attr['default']),
		});
	};
ViewMap.createViewDataFromObj = function  (data) {
		return new ViewData({
			route: data.route,
			path: data.path || data.view,
			'default': Boolean(data['default']),
		});
	};
ViewMap.getRouteByPath = function (viewManager, path) {
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
	};
ViewMap.bindRouter = function (viewManager, model, ctx) {
		var viewmap = ViewMap.ensure(viewManager, model, ctx);
		if (viewmap == null) {
			console.error('Viewmap is undefined');
			return;
		}
		if (viewManager.xNested === true && viewManager.isNested() === true) {
			return;
		}
		for(var key in viewmap) {
			console.log('BIND', key);
			ruta.add(key, route => {
				viewManager.navigate(route.current.path);
			});
		}
	};

