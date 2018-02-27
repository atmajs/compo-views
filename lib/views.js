// source /src/umd.es6
/*!
 * Form Component v0.10.32
 * Part of the Atma.js Project
 * http://atmajs.com/
 *
 * MIT license
 * http://opensource.org/licenses/MIT
 *
 * (c) 2012, 2018 Atma.js and other contributors
 */
(function (root, factory) {
	var _global = typeof global !== 'undefined' ? global : window,
	    _mask = resolve('mask', 'maskjs'),
	    _ruta = resolve('ruta', 'ruta');

	function resolve(property, npm) {
		var lib = _global[property] || _global.atma && _global.atma[property];
		if (lib != null) {
			return lib;
		}
		if (typeof require === 'function') {
			return require(npm);
		}
		throw Error(property + ' was not loaded');
	}

	factory(_global, _mask, _mask.jmask, _mask.Compo, _mask.Compo.config.getDOMLibrary(), _ruta);
})(this, function (global, mask, j, Compo, $, ruta) {

	// source utils/path.es6
	var path_getCurrent;
	(function () {

		path_getCurrent = function (ctx) {
			return mask.obj.get(ctx, 'req.url') || global.location.pathname + global.location.search + global.location.hash;
		};
	})();
	// end:source utils/path.es6

	// source class/ViewData.es6
	var ViewData, ViewState;

	(function () {

		ViewState = {
			NONE: 0,
			LOADING: 1,
			LOADED: 2,
			RENDERING: 3,
			RENDERED: 4
		};

		ViewData = mask.class.create({
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
			constructor(...args) {
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
			getNodes() {
				if (this.viewNode != null) {
					if (this.path != null && this.viewNode.nodes == null) {
						this.viewNode.nodes = mask.parse(`import from '${this.path}'`);
					}
					return this.viewNode;
				}
				if (this.nodes == null && this.path != null) {
					return this.nodes = mask.parse(`import from '${this.path}'`);
				}
				return this.nodes;
			},
			toJSON() {
				return {
					route: this.route,
					state: this.state,
					path: this.path,
					viewNode: this.viewNode ? mask.stringify(this.viewNode) : null,
					nodes: this.nodes ? mask.stringify(this.nodes) : null
				};
			},
			createViewNode(nodes) {
				var $ = j(nodes);

				if (this.hasView_($) === false) {
					var container = this.viewNode || j('View');
					this.viewNode = j(container).append(nodes);
					return;
				}
				this.viewNode = $[0];
			},
			hasView_($nodes) {
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

		ViewData.createFromNode = function (viewNode) {
			return new ViewData({
				viewNode: viewNode,
				route: viewNode.attr.route,
				path: viewNode.attr.path,
				'default': Boolean(viewNode.attr['default'])
			});
		};
		ViewData.createFromObj = function (data) {
			return new ViewData({
				route: data.route,
				path: data.path || data.view,
				'default': Boolean(data['default'])
			});
		};
	})();
	// end:source class/ViewData.es6
	// source class/ViewMap.es6
	var ViewMap;
	(function () {
		ViewMap = mask.class.create({
			views: null,
			constructor() {
				this.views = [];
			},
			add(viewData) {
				this.views.push(viewData);
			},
			each(fn) {
				var imax = this.views.length,
				    i = -1;
				while (++i < imax) fn(this.views[i]);
			},
			toJSON() {
				return this.views.map(x => x.toJSON());
			}
		});

		ViewMap.ensure = function (viewManager, model, ctx) {
			var viewmap = viewManager.viewmap;
			if (viewmap != null) {
				return viewmap;
			}
			var viewmap = new ViewMap();
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
				arr.map(ViewData.createFromObj).forEach(x => {
					viewmap.add(new ViewData(viewmap[x.route], x));
				});
			} else if (mask.is.Object(scoped)) {
				var obj = scoped;
				for (var key in obj) {
					var entry = obj[key];
					if (entry.route == null) {
						entry.route = key;
					}
					viewmap.add(ViewData.createFromObj(entry));
				}
			}
			mask.jmask(viewManager.nodes).filter('View').map(ViewData.createFromNode).each(x => {
				viewmap.add(new ViewData(viewmap[x.route], x));
			});

			return viewManager.viewmap = viewmap;
		};

		ViewMap.getFromRoutes = function (vm, ctx) {
			if (ctx.page == null || ctx.config == null) {
				return null;
			}
			var current = ctx.page.data,
			    pages = ctx.config.pages,
			    key,
			    page,
			    arr = [];
			for (key in pages) {
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
			while (++i < imax) {
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
			while (++i < imax) {
				var view = views[i];
				if (view.default == true) {
					var route = routes.get(view.route);
					if (route.definition.indexOf('?') > -1) {
						ruta.navigate(route.definition, {
							extend: true,
							silent: true,
							replace: true
						});
					}
					return route;
				}
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
				while (++i < imax) {
					var view = views[i];
					if (view.default == true) {
						route = routes.get(view.route);
						break;
					}
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

		function obj_default(a, b) {
			if (b == null) {
				return a;
			}
			if (a == null) {
				return b;
			}
			for (var key in b) {
				if (a[key] == null) {
					a[key] = b[key];
				}
			}
			return a;
		}
	})();
	// end:source class/ViewMap.es6

	// source class/ActivityTracker.es6
	var ActivityTracker;
	(function () {
		ActivityTracker = mask.class.create({
			tickStart: null,
			tickEnd: null,
			history: null,
			vm: null,
			constructor(viewManager) {
				this.history = [];
				this.routes = [];
				this.vm = viewManager;
				this.activityCounter = 0;
				this.isBusy = false;
			},
			show(route, loaderFn) {
				var i = this.routes.indexOf(route),
				    dfr;
				if (i === -1) {
					route.dfr = dfr = loaderFn();
					this.routes.push(route);
				} else {
					dfr = this.routes[i].dfr;
				}

				this.history.push({ current: route.current, route: route });
				this._requestProgressStart();
				return dfr.done(() => this._requestProgressEnd(route)).fail(error => console.error(error));
			},
			clear(route) {
				var i = this.routes.indexOf(route);
				if (i === -1) return;

				route.dfr = null;
				route.value.compo = null;
				this.routes.splice(i, 1);
			},
			_requestProgressStart(route) {
				this._activity(1, route);
			},
			_requestProgressEnd(route) {
				this._activity(-1, route);
			},
			_cancelProgressStart() {
				clearTimeout(this.tickStart);
			},
			_cancelProgressEnd() {
				clearTimeout(this.tickEnd);
			},
			_progressStart(route) {
				this._cancelProgressStart();
				this._cancelProgressEnd();
				this.isBusy = true;
				this.vm.emitIn('viewActivity', 'start');
			},
			_progressEnd(route) {
				// if (route != null && this.current !== route) {
				// 	return;
				// }
				this._cancelProgressStart();
				this._cancelProgressEnd();
				this.isBusy = false;
				this.vm.emitIn('viewActivity', 'end');
			},
			_activity(val, route) {
				this._cancelProgressEnd();
				this._cancelProgressStart();

				if ((this.activityCounter += val) < 0) {
					this.activityCounter = 0;
				}
				var shouldBeBusy = this.activityCounter > 0;
				if (shouldBeBusy === this.isBusy) {
					return;
				}
				if (shouldBeBusy) {
					this.tickStart = setTimeout(this._progressStart.bind(this, route));
				} else {
					this.tickEnd = setTimeout(this._progressEnd.bind(this, route));
				}
			},
			get current() {
				var track = this.history[this.history.length - 1];
				return track && track.route;
			},
			back() {
				this.history.pop();
				return this.history.pop();
			}
		});
	})();
	// end:source class/ActivityTracker.es6
	// source class/ViewChanger.es6
	var ViewChanger;
	(function () {
		ViewChanger = mask.class.create({
			vm: null,
			constructor(viewManager) {
				this.vm = viewManager;
			},
			show(route, prevRoute, isInitial) {
				var show = this.getShow(route, prevRoute);
				var hide = this.getHide(prevRoute, route);
				if (show.parallel) {
					this.hide_(hide, prevRoute);
					this.show_(show, route, isInitial);
					return;
				}
				this.hide_(hide, prevRoute).then(() => this.show_(show, route, isInitial));
			},

			show_(ani, route, isInitial) {
				return mask.class.Deferred.run(resolve => {
					this.vm.showCompo_(route.value.compo, isInitial).then(() => {
						var el = route.value.compo.$[0];
						ani.start(resolve, el, { route: route, isInitial: isInitial });
					});
				});
			},
			hide_(ani, route) {
				return mask.class.Deferred.run(resolve => {
					if (route.value.compo == null) {
						resolve();
						return;
					}
					ani.start(() => {
						this.vm.hideCompo_(route.value.compo).then(resolve);
					}, route.value.compo.$[0], { route: route });
				});
			},

			getShow(route, beforeRoute) {
				return this.getAniForRoute(route, 'show', beforeRoute);
			},
			getHide(route, nextRoute) {
				return this.getAniForRoute(route, 'hide', nextRoute);
			},
			getAniForCompo(compo, id, pairedRouteDefinition) {
				return findAnimation(compo, id, pairedRouteDefinition);
			},
			getAniForRoute(route, id, anchorRoute) {
				var pairedDef = anchorRoute.definition;
				var ani = this.getAniForCompo(route.value.compo, id, pairedDef);
				if (ani == null) {
					ani = this.getAniForCompo(this.vm, id, pairedDef);
				}
				return ani ? ani : Default;
			}
		});

		var Default = {
			attr: {},
			start(cb) {
				cb();
			}
		};

		function findAnimation(owner, id, pairedRouteDefinition) {
			if (owner == null) {
				return null;
			}
			var compos = owner.components;
			if (compos == null) {
				return null;
			}
			var imax = compos.length,
			    i = -1,
			    default_ = null;
			while (++i < imax) {
				var compo = compos[i];
				var name = compo.compoName || compo.tagName;
				if (name === 'imports' || name === 'import') {
					var ani = findAnimation(compo, id, pairedRouteDefinition);
					if (ani) {
						return ani;
					}
				}
				if (name === 'Animation' && compo.attr.id === id) {
					var for_ = compo.attr.for;
					if (for_ == null && default_ == null) {
						default_ = compo;
					}
					if (for_ === pairedRouteDefinition) {
						return compo;
					}
				}
			}
			return default_;
		}
	})();
	// end:source class/ViewChanger.es6

	// source compo/ViewManager.es6
	var ViewManagerCompo = mask.Compo({
		tagName: 'div',
		attr: {
			style: 'position: relative',
			class: 'v-manager'
		},

		meta: {
			attributes: {
				base: '',
				viewmap: '',
				routing: true,
				nested: true
			},
			serializeScope: true
		},

		serializeScope() {
			return JSON.stringify(this.scope);
		},

		slots: {
			viewNavigate(sender, path, model) {
				if (sender === this) return;
				var current = this.route;
				var compo = current && current.value && current.value.compo;
				this.navigate(path, model, { defaultView: false });
				return false;
			},
			viewActivation(sender) {
				if (sender === this) return;
				var compo = this.route && this.route.value && this.route.value.compo;
				if (compo) {
					//compo.emitIn('viewActivation', this.route.current.params);
				}
				return false;
			},
			viewDeactivation(sender) {
				var compo = this.route && this.route.value && this.route.value.compo;
				if (compo) {
					//compo.emitIn('viewDeactivation');
				}
				return false;
			},
			back(sender) {
				var track = this.activityTracker.back();
				this.navigate(track.current.path);
			}
		},

		scope: {
			notificationMsg: '',
			notificationType: '',
			viewmap: null
		},

		viewmap: null,
		routes: null,
		route: null,
		next: null,

		activity(type, ...args) {
			this.emitIn('views:activity', type, ...args);
		},

		constructor() {
			this.routes = new ruta.Collection();
		},

		onRenderStart(model, ctx) {
			ViewMap.ensure(this, model, ctx);
			ViewMap.createRoutes(this);

			var path = path_getCurrent(ctx);
			var route = ViewMap.getRouteByPath(this, path);

			ctx.params = route && route.current && route.current.params;

			this.attr.path = path;
			this.route = route;
			this.nodes = j().add(this.getCompo_('Notification')).add(this.getCompo_('Progress')).add(this.getCompo_('Animation'), false);

			if (route == null) {
				return;
			}
			var viewData = route.value;
			if (viewData.path == null) {
				this.nodes.add(viewData.getNodes() || j());
				return;
			}
			var resume = Compo.pause(this, ctx);
			this.loadView(route, model).done(route => {
				this.nodes.add(viewData.getNodes() || j());
				resume();
			}).fail(() => resume());
		},
		onRenderStartClient(model, ctx) {
			ViewMap.ensure(this, model, ctx);
			ViewMap.createRoutes(this);
		},
		onRenderEndServer() {
			this.scope.viewmap = this.viewmap.toJSON();
		},
		onRenderEnd(elements, model, ctx) {
			this.activityTracker = new ActivityTracker(this);
			this.viewChanger = new ViewChanger(this);
			this.ctx = ctx;

			if (this.xRouting) {
				ViewMap.bindRouter(this, model, ctx);
			}
			if (this.route == null && this.attr.path != null) {
				this.route = ViewMap.getRouteByPath(this, this.attr.path);
			}
			if (this.route == null) {
				return;
			}
			var viewData = this.route.value;
			var compo = this.find('View');
			if (compo != null) {
				compo.emitIn('viewActivation');
			}
			viewData.compo = compo;
			this.activityTracker.show(this.route, () => Compo.await(this));
		},
		getCtx(route) {
			var ctx = mask.obj.extend(null, this.ctx);
			ctx.params = route.current.params;
			return ctx;
		},
		isNested() {
			var owner = Compo.closest(this.parent, 'ViewManager');
			return owner != null;
		},
		navigate(path, model, opts) {
			var route = ViewMap.getRouteByPathOrCurrentOrDefault(this, path, opts && opts.params);
			var dfr = new mask.class.Deferred();
			if (route == null) {
				return dfr.reject(`View not found: ${path}`);
			}
			var initial = route.value.compo == null;
			if (route === this.route) {
				if (initial === false) {
					route.value.compo.emitIn('viewNavigate', path);
				}
				return dfr.resolve(route);
			}
			return this.activityTracker.show(route, () => this.loadView(route, model).then(() => this.renderView(route, model))).done(() => {
				if (initial === false) {
					route.value.compo.emitIn('viewNavigate', path);
				}
				this.performShow(route, initial);
			});
		},

		hideCompo_(compo) {
			if (compo == null) return;
			compo.emitIn('viewDeactivation', this);
			return compo.hide_();
		},

		showCompo_(compo, isInitial) {
			return compo.show_().then(() => compo.emitIn('viewActivation', this));
		},

		emit(type, ...args) {
			Compo.pipe('views').emit(type, this, ...args);
		},

		activate(route) {
			compo.emitIn('viewActivation', route.current.params);
		},

		loadView(route, model) {
			return mask.class.Deferred.run((resolve, reject) => {
				var viewData = route.value;
				if (viewData.viewNode != null) {
					resolve(route);
					return;
				}
				var path = viewData.path;
				mask.Module.createModule(new mask.Module.Endpoint(path, 'mask')).loadModule().fail(reject).done(module => {
					var nodes = module.exports.__nodes__;
					viewData.createViewNode(nodes);
					resolve(route);
				});
			});
		},
		renderView(route, model) {
			return mask.class.Deferred.run((resolve, reject, dfr) => {
				if (route.value.compo) {
					resolve(route);
					return;
				}
				var ctx = this.getCtx(route);
				mask.renderAsync(route.value.getNodes(), model || this.model, ctx, null, this).done((frag, compo) => {
					var last = compo.components[compo.components.length - 1];
					var view = Compo.prototype.find.call(last, 'View');
					route.value.compo = view;
					resolve(route);
				});
			});
		},
		performShow(route, isInitial) {
			var current = this.route;
			if (current === route) {
				return;
			}
			this.route = route;
			this.viewChanger.show(route, current, isInitial);

			if (current != null && current.value.compo != null) {
				if (current.value.compo.xRecycle === true) {
					this.activityTracker.clear(current);
				}
			}
		},

		notify(type, message) {
			if (arguments.length === 0) {
				type = message = '';
			}
			this.scope.notificationType = type;
			this.scope.notificationMsg = message;
			this.emitIn('formNotification', { type, message });
		},

		getCompo_(name, shouldCreate = true) {
			var set = j(this).children(name);
			if (shouldCreate === false) {
				return set;
			}
			return set.length === 0 ? j(name) : set;
		},

		throw_(error) {
			this.nodes = mask.parse(`
				div style='background: red; color: white; padding: 15px; font-weight: bold' {
					"${error.message}"
				}
			`);
		},

		errored_(error) {
			this.activity('end');
			this.activity('error', error);
			this.notify('danger', error.message || String(error));
		}
	});

	// source Controls/exports.es6
	var Template = `
		// source Notification.mask
		let Notification as (div) {
			
			slot formNotification () {
				var form = this.closest('a:form');
				if (!form.scope.notificationMsg) {
					return;
				}
				var el = this.$.get(0);
				if (el) {
					el.scrollIntoView(true);
				}
			}
			
			@if (template) {
				@template;
			}
			@else {
				+if (notificationMsg) {
					.alert.alert-~[bind: $scope.notificationType] > '~[bind: $scope.notificationMsg ]'
				}
			}
		}
		// end:source Notification.mask
		// source Progress.mask
		let Progress {
			var value = -1;
			var progress = false;
		
			slot viewActivity (sender, type, percent) {
				if (type === 'start') {
					this.scope.progress = true;
				}
				if (type === 'end') {
					this.scope.progress = false;
				}
				if (type === 'progress' && typeof percent === 'number') {
					this.scope.value = percent;
				}
			}
		
			.-a-views-progress style='display: ~[bind: $scope.progress ? "block" : "none" ]'{
		
				progress value='~[bind: $scope.value == -1 ? null : $scope.value]' max=100;
		
				style scoped {
					progress {
						display: block;
						margin: auto;
						width: 98%;
						height: 3px;
					}
				}
			}
		}
		// end:source Progress.mask
	`;
	mask.define(ViewManagerCompo, Template);
	// end:source Controls/exports.es6
	// source View.es6
	var ViewCompo;
	(function () {

		var view_NONE = 1,
		    view_DETACHED = 2,
		    view_ATTACHED = 3,
		    view_VISIBLE = 4,
		    view_HIDDEN = 5;

		ViewCompo = Compo({
			meta: {
				attributes: {
					'default': false,
					'detach': true,
					'recycle': false,
					'replace': {
						description: 'This node should be replaced with the loaded template',
						default: false
					}
				}
			},
			slots: {
				viewDeactivation() {
					if (this.state === view_HIDDEN) {
						return false;
					}
					this.state = view_HIDDEN;
				}
			},
			tagName: 'div',
			attr: {
				class: 'v-view',
				style: 'position:relative'
			},
			onRenderStart() {},
			state: view_NONE,
			hide_() {
				return this.hide().then(() => {
					if (this.xRecycle === true) {
						this.remove();
						return;
					}
					if (this.xDetach === true) {
						this.state = view_DETACHED;
						var fn = this.$.detach || this.$.remove;
						fn.call(this.$);
					}
				});
			},
			show_() {
				if (this.state <= view_ATTACHED) {
					this.parent.$.append(this.$);
				}
				if (this.state === view_NONE) {
					this.emitIn('domInsert');
					this.state = view_ATTACHED;
				}
				return this.show();
			},
			hide() {
				this.$.hide();
				return new mask.class.Deferred().resolve();
			},
			show() {
				this.$.show();
				return new mask.class.Deferred().resolve();
			}
		});

		mask.define(ViewManagerCompo, 'View', ViewCompo);
	})();
	// end:source View.es6
	// end:source compo/ViewManager.es6
	mask.registerHandler('ViewManager', ViewManagerCompo);
});
// end:source /src/umd.es6