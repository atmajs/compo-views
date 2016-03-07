var ViewMap;
(function(){
	ViewMap = mask.class.create({
		views: null,
		constructor () {
			this.views = [];
		},
		add (viewData) {
			this.views.push(viewData);
		},
		each (fn) {
			var imax = this.views.length,
				i = -1;
			while( ++i < imax ) fn(this.views[i]);
		},
		toJSON () {
			return this.views.map(x => x.toJSON());
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
				.map(ViewData.createFromObj)
				.forEach(x => {
					viewmap.add(new ViewData(viewmap[x.route], x));
				});
		}
		else if (mask.is.Object(scoped)) {
			var obj = scoped;
			for (var key in obj) {
				var entry = obj[key];
				if (entry.route == null) {
					entry.route = key;
				}
				viewmap.add(ViewData.createFromObj(entry));
			}
		}
		mask
			.jmask(viewManager.nodes)
			.filter('View')
			.map(ViewData.createFromNode)
			.each(x => {
				viewmap.add(new ViewData(viewmap[x.route], x));
			});

		return (viewManager.viewmap = viewmap);
	};

	ViewMap.createRoutes = function (viewManager) {
		var viewmap = viewManager.viewmap,
			views = viewmap.views,
			imax = views.length,
			i = -1;
		while( ++i < imax ) {
			var view = views[i];
			viewManager.routes.add(view.route, view);
		}
	};

	ViewMap.getRouteByPath = function (viewManager, path) {
		var routes = viewManager.routes,
			route = routes.get(path);
		if (route) {
			return route;
		}
		var viewmap = viewManager.viewmap,
			views = viewmap.views,
			imax = views.length,
			i = -1;
		while( ++i < imax ) {
			var view = views[i];
			if (view.default == true) {
				return routes.get(view.route);
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
		viewmap.each(view => {
			ruta.add(view.route, route => {
				viewManager.navigate(route.current.path);
			});
		});
	};

}());
