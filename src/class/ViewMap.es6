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
		var viewmap = new ViewMap;
		var scoped = viewManager.scope.viewmap;

		if (scoped == null && viewManager.xViewmap) {
			var fn = mask.Utils.Expression.eval;
			scoped = fn(viewManager.xViewmap, model, ctx, viewManager);
		}

		if (scoped == null && mask.is.NODE) {
			scoped = ViewMap.getFromRoutes(viewManager, ctx);
		}

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

	ViewMap.getFromRoutes = function(vm, ctx){
		if (ctx.page == null || ctx.config == null) {
			return null;
		}
		var current = ctx.page.data,
			pages = ctx.config.pages,
			key, page, arr = [];
		for(key in pages) {
			page = pages[key];
			if (page.template === current.template) {
				arr.push(page);
			}
		}
		return arr;
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
			let view = views[i];
			let d = view.default;
			if (!d) {
				continue;
			}
			let path = view.route;
			if (typeof d === 'string' && d !== 'true' && d !== 'false' && d !== 'default') {
				path = d;
			}
			var route = routes.get(path);
			if (route.definition.indexOf('?') > -1) {
				ruta.navigate(route.definition, {
					extend: true,
					silent: true,
					replace: true
				});
			}
			return route;
		}
		return null;
	};

	ViewMap.getRouteByPathOrCurrentOrDefault = function (viewManager, path, params) {
		var routes = viewManager.routes,
			route = routes.get(path),
			fromPath = route != null;
		if (route == null) {
			route = viewManager.route;
		} else {
			obj_default(route.current.params, params);
		}

		if (route == null) {
			var viewmap = viewManager.viewmap,
				views = viewmap.views,
				imax = views.length,
				i = -1;
			while( ++i < imax ) {
				var view = views[i];
				let d = view.default;
				if (!d) {
					continue;
				}
				let path = view.route;
				if (typeof d === 'string' && d !== 'true' && d !== 'false' && d !== 'default') {
					path = d;
				}
				route = routes.get(path);
				break;
			}
		}
		if (route == null) {
			return null;
		}
		if (fromPath === false && route.definition.indexOf('?') > -1) {
			ruta.navigate(route.definition, {
				extend: true,
				silent: true,
				replace: true
			});
		}
		return route;
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
				var current = route.current,
					path = current.path,
					params = current.params;
				viewManager.navigate(path, null, { params: params });
			});
		});
	};


	function obj_default (a, b) {
		if (b == null) {
			return a;
		}
		if (a == null) {
			return b;
		}
		for(var key in b) {
			if (a[key] == null) {
				a[key] = b[key];
			}
		}
		return a;
	}
}());
