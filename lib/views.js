// source /src/umd.es6
'use strict';

/*!
 * Form Component v0.10.45
 * Part of the Atma.js Project
 * http://atmajs.com/
 *
 * MIT license
 * http://opensource.org/licenses/MIT
 *
 * (c) 2012, 2020 Atma.js and other contributors
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
})(undefined, function (global, mask, j, Compo, $, ruta) {

	// source utils/path.es6
	'use strict';

	var path_getCurrent;
	(function () {

		path_getCurrent = function path_getCurrent(ctx) {
			return mask.obj.get(ctx, 'req.url') || ruta.currentPath();
		};
	})();
	//# sourceMappingURL=path.es6.map
	// end:source utils/path.es6

	// source class/ViewData.es6
	'use strict';

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
			constructor: function constructor() {
				var imax = arguments.length,
				    i = -1;
				while (++i < imax) {
					var x = arguments.length <= i ? undefined : arguments[i];
					if (x == null) {
						continue;
					}
					mask.obj.extend(this, x);
					if (x.view != null && this.path == null) {
						this.path = x.view;
					}
				}
			},
			getNodes: function getNodes() {
				if (this.viewNode != null) {
					if (this.path != null && this.viewNode.nodes == null) {
						this.viewNode.nodes = mask.parse('import from \'' + this.path + '\'');
					}
					return this.viewNode;
				}
				if (this.nodes == null && this.path != null) {
					return this.nodes = mask.parse('import from \'' + this.path + '\'');
				}
				return this.nodes;
			},
			toJSON: function toJSON() {
				return {
					route: this.route,
					state: this.state,
					path: this.path,
					viewNode: this.viewNode ? mask.stringify(this.viewNode) : null,
					nodes: this.nodes ? mask.stringify(this.nodes) : null
				};
			},
			createViewNode: function createViewNode(nodes) {
				var $ = j(nodes);

				if (this.hasView_($) === false) {
					var container = this.viewNode || j('View');
					this.viewNode = j(container).append(nodes);
					return;
				}
				this.viewNode = $[0];
			},
			hasView_: function hasView_($nodes) {
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
	//# sourceMappingURL=ViewData.es6.map
	// end:source class/ViewData.es6
	// source class/ViewMap.es6
	'use strict';

	var ViewMap;
	(function () {
		ViewMap = mask.class.create({
			views: null,
			constructor: function constructor() {
				this.views = [];
			},
			add: function add(viewData) {
				this.views.push(viewData);
			},
			each: function each(fn) {
				var imax = this.views.length,
				    i = -1;
				while (++i < imax) {
					fn(this.views[i]);
				}
			},
			toJSON: function toJSON() {
				return this.views.map(function (x) {
					return x.toJSON();
				});
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
				arr.map(ViewData.createFromObj).forEach(function (x) {
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
			mask.jmask(viewManager.nodes).filter('View').map(ViewData.createFromNode).each(function (x) {
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
				if (view.default && view.default !== false) {
					var _path = typeof view.default === 'string' ? view.default : view.route;

					var route = routes.get(_path);
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
					if (view.default && view.default !== false) {
						var _path2 = typeof view.default === 'string' ? view.default : view.route;

						route = routes.get(_path2);
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
			viewmap.each(function (view) {
				ruta.add(view.route, function (route) {
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
	//# sourceMappingURL=ViewMap.es6.map
	// end:source class/ViewMap.es6

	// source class/ActivityTracker.es6
	'use strict';

	var ActivityTracker;
	(function () {
		ActivityTracker = mask.class.create({
			tickStart: null,
			tickEnd: null,
			history: null,
			vm: null,
			constructor: function constructor(viewManager) {
				this.history = [];
				this.routes = [];
				this.vm = viewManager;
				this.activityCounter = 0;
				this.isBusy = false;
			},
			show: function show(route, loaderFn) {
				var _this = this;

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
				return dfr.done(function () {
					return _this._requestProgressEnd(route);
				}).fail(function (error) {
					return console.error(error);
				});
			},
			clear: function clear(route) {
				var i = this.routes.indexOf(route);
				if (i === -1) return;

				route.dfr = null;
				route.value.compo = null;
				this.routes.splice(i, 1);
			},
			_requestProgressStart: function _requestProgressStart(route) {
				this._activity(1, route);
			},
			_requestProgressEnd: function _requestProgressEnd(route) {
				this._activity(-1, route);
			},
			_cancelProgressStart: function _cancelProgressStart() {
				clearTimeout(this.tickStart);
			},
			_cancelProgressEnd: function _cancelProgressEnd() {
				clearTimeout(this.tickEnd);
			},
			_progressStart: function _progressStart(route) {
				this._cancelProgressStart();
				this._cancelProgressEnd();
				this.isBusy = true;
				this.vm.emitIn('viewActivity', 'start');
			},
			_progressEnd: function _progressEnd(route) {
				// if (route != null && this.current !== route) {
				// 	return;
				// }
				this._cancelProgressStart();
				this._cancelProgressEnd();
				this.isBusy = false;
				this.vm.emitIn('viewActivity', 'end');
			},
			_activity: function _activity(val, route) {
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
			back: function back() {
				this.history.pop();
				return this.history.pop();
			}
		});
	})();
	//# sourceMappingURL=ActivityTracker.es6.map
	// end:source class/ActivityTracker.es6
	// source class/ViewChanger.es6
	'use strict';

	var ViewChanger;
	(function () {
		ViewChanger = mask.class.create({
			vm: null,
			constructor: function constructor(viewManager) {
				this.vm = viewManager;
			},
			show: function show(route, prevRoute, isInitial) {
				var _this = this;

				var show = this.getShow(route, prevRoute);
				var hide = this.getHide(prevRoute, route);
				if (show.parallel) {
					this.hide_(hide, prevRoute);
					this.show_(show, route, isInitial);
					return;
				}
				this.hide_(hide, prevRoute).then(function () {
					return _this.show_(show, route, isInitial);
				});
			},
			show_: function show_(ani, route, isInitial) {
				var _this2 = this;

				return mask.class.Deferred.run(function (resolve) {
					_this2.vm.showCompo_(route.value.compo, isInitial).then(function () {
						var el = route.value.compo.$[0];
						ani.start(resolve, el, { route: route, isInitial: isInitial });
					});
				});
			},
			hide_: function hide_(ani, route) {
				var _this3 = this;

				return mask.class.Deferred.run(function (resolve) {
					if (route.value.compo == null) {
						resolve();
						return;
					}
					ani.start(function () {
						_this3.vm.hideCompo_(route.value.compo).then(resolve);
					}, route.value.compo.$[0], { route: route });
				});
			},
			getShow: function getShow(route, beforeRoute) {
				return this.getAniForRoute(route, 'show', beforeRoute);
			},
			getHide: function getHide(route, nextRoute) {
				return this.getAniForRoute(route, 'hide', nextRoute);
			},
			getAniForCompo: function getAniForCompo(compo, id, pairedRouteDefinition) {
				return findAnimation(compo, id, pairedRouteDefinition);
			},
			getAniForRoute: function getAniForRoute(route, id, anchorRoute) {
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
			start: function start(cb) {
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
	//# sourceMappingURL=ViewChanger.es6.map
	// end:source class/ViewChanger.es6

	// source compo/ViewManager.es6
	'use strict';

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

		serializeScope: function serializeScope() {
			return JSON.stringify(this.scope);
		},

		slots: {
			viewNavigate: function viewNavigate(sender, path, model, route) {
				if (sender === this) return;
				var current = this.route;
				var compo = current && current.value && current.value.compo;
				this.navigate(path, model, {
					defaultView: false,
					fromParent: true,
					params: route && route.current.params || null
				});
				return false;
			},
			viewActivation: function viewActivation(sender) {
				if (sender === this) return;
				var compo = this.route && this.route.value && this.route.value.compo;
				if (compo) {
					//compo.emitIn('viewActivation', this);
				}
				return false;
			},
			viewDeactivation: function viewDeactivation(sender) {
				if (sender === this) return;
				var compo = this.route && this.route.value && this.route.value.compo;
				if (compo) {
					compo.emitIn('viewDeactivation', this);
				}
				return false;
			},
			back: function back(sender) {
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

		activity: function activity(type) {
			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}

			this.emitIn.apply(this, ['views:activity', type].concat(args));
		},
		constructor: function constructor() {
			this.routes = new ruta.Collection();
		},
		onRenderStart: function onRenderStart(model, ctx) {
			var _this2 = this;

			ViewMap.ensure(this, model, ctx);
			ViewMap.createRoutes(this);

			var path = path_getCurrent(ctx);
			var route = ViewMap.getRouteByPath(this, path);
			var params = route && route.current && route.current.params;
			if (params) {
				if (ctx.params == null) {
					ctx.params = {};
				}
				mask.obj.extend(ctx.params, params);
			}

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
			this.loadView(route, model).done(function (route) {
				_this2.nodes.add(viewData.getNodes() || j());
				resume();
			}).fail(function () {
				return resume();
			});
		},
		onRenderStartClient: function onRenderStartClient(model, ctx) {
			ViewMap.ensure(this, model, ctx);
			ViewMap.createRoutes(this);
		},
		onRenderEndServer: function onRenderEndServer() {
			this.scope.viewmap = this.viewmap.toJSON();
		},
		onRenderEnd: function onRenderEnd(elements, model, ctx) {
			var _this3 = this;

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
				compo.emitIn('viewActivation', this);
			}
			viewData.compo = compo;
			this.activityTracker.show(this.route, function () {
				return Compo.await(_this3);
			});
		},
		getCtx: function getCtx(route) {
			var ctx = mask.obj.extend(null, this.ctx);
			ctx.params = route.current.params;
			return ctx;
		},
		isNested: function isNested() {
			var owner = Compo.closest(this.parent, 'ViewManager');
			return owner != null;
		},
		navigate: function navigate(path, model, opts) {
			var _this4 = this;

			var route = ViewMap.getRouteByPathOrCurrentOrDefault(this, path, opts && opts.params);
			var dfr = new mask.class.Deferred();
			if (route == null) {
				return dfr.reject('View not found: ' + path);
			}
			var initial = route.value.compo == null;
			if (route === this.route) {
				if (initial === false) {
					route.value.compo.emitIn('viewNavigate', path, model, route);
				}
				if (opts && opts.fromParent === true && route.value.compo) {
					route.value.compo.emitIn('viewActivation', this);
				}
				return dfr.resolve(route);
			}
			return this.activityTracker.show(route, function () {
				return _this4.loadView(route, model).then(function () {
					return _this4.renderView(route, model);
				});
			}).done(function () {
				if (initial === false) {
					route.value.compo.emitIn('viewNavigate', path);
				}
				_this4.performShow(route, initial);
			});
		},
		hideCompo_: function hideCompo_(compo) {
			if (compo == null) return;
			compo.emitIn('viewDeactivation', this);
			return compo.hide_();
		},
		showCompo_: function showCompo_(compo, isInitial) {
			var _this5 = this;

			return compo.show_().then(function () {
				return compo.emitIn('viewActivation', _this5);
			});
		},
		emit: function emit(type) {
			var _Compo$pipe;

			for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
				args[_key2 - 1] = arguments[_key2];
			}

			(_Compo$pipe = Compo.pipe('views')).emit.apply(_Compo$pipe, [type, this].concat(args));
		},
		loadView: function loadView(route, model) {
			return mask.class.Deferred.run(function (resolve, reject) {
				var viewData = route.value;
				if (viewData.viewNode != null) {
					resolve(route);
					return;
				}
				var path = viewData.path;
				mask.Module.createModule(new mask.Module.Endpoint(path, 'mask')).loadModule().fail(reject).done(function (module) {
					var nodes = module.exports.__nodes__;
					viewData.createViewNode(nodes);
					resolve(route);
				});
			});
		},
		renderView: function renderView(route, model) {
			var _this6 = this;

			return mask.class.Deferred.run(function (resolve, reject, dfr) {
				if (route.value.compo) {
					resolve(route);
					return;
				}
				var ctx = _this6.getCtx(route);
				mask.renderAsync(route.value.getNodes(), model || _this6.model, ctx, null, _this6).done(function (frag, compo) {
					var last = compo.components[compo.components.length - 1];
					var view = Compo.prototype.find.call(last, 'View');
					route.value.compo = view;
					resolve(route);
				});
			});
		},
		performShow: function performShow(route, isInitial) {
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
		notify: function notify(type, message) {
			if (arguments.length === 0) {
				type = message = '';
			}
			this.scope.notificationType = type;
			this.scope.notificationMsg = message;
			this.emitIn('formNotification', { type: type, message: message });
		},
		getCompo_: function getCompo_(name) {
			var shouldCreate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

			var set = j(this).children(name);
			if (shouldCreate === false) {
				return set;
			}
			return set.length === 0 ? j(name) : set;
		},
		throw_: function throw_(error) {
			this.nodes = mask.parse('\n\t\t\tdiv style=\'background: red; color: white; padding: 15px; font-weight: bold\' {\n\t\t\t\t"' + error.message + '"\n\t\t\t}\n\t\t');
		},
		errored_: function errored_(error) {
			this.activity('end');
			this.activity('error', error);
			this.notify('danger', error.message || String(error));
		}
	});

	// source Controls/exports.es6
	"use strict";

	var Template = "\n\t// source Notification.mask\n\tlet Notification as (div) {\n\t\t\n\t\tslot formNotification () {\n\t\t\tvar form = this.closest('a:form');\n\t\t\tif (!form.scope.notificationMsg) {\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tvar el = this.$.get(0);\n\t\t\tif (el) {\n\t\t\t\tel.scrollIntoView(true);\n\t\t\t}\n\t\t}\n\t\t\n\t\t@if (template) {\n\t\t\t@template;\n\t\t}\n\t\t@else {\n\t\t\t+if (notificationMsg) {\n\t\t\t\t.alert.alert-~[bind: $scope.notificationType] > '~[bind: $scope.notificationMsg ]'\n\t\t\t}\n\t\t}\n\t}\n\t// end:source Notification.mask\n\t// source Progress.mask\n\tlet Progress {\n\t\tvar value = -1;\n\t\tvar progress = false;\n\t\n\t\tslot viewActivity (sender, type, percent) {\n\t\t\tif (type === 'start') {\n\t\t\t\tthis.scope.progress = true;\n\t\t\t}\n\t\t\tif (type === 'end') {\n\t\t\t\tthis.scope.progress = false;\n\t\t\t}\n\t\t\tif (type === 'progress' && typeof percent === 'number') {\n\t\t\t\tthis.scope.value = percent;\n\t\t\t}\n\t\t}\n\t\n\t\t.-a-views-progress style='display: ~[bind: $scope.progress ? \"block\" : \"none\" ]'{\n\t\n\t\t\tprogress value='~[bind: $scope.value == -1 ? null : $scope.value]' max=100;\n\t\n\t\t\tstyle scoped {\n\t\t\t\tprogress {\n\t\t\t\t\tdisplay: block;\n\t\t\t\t\tmargin: auto;\n\t\t\t\t\twidth: 98%;\n\t\t\t\t\theight: 3px;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\t// end:source Progress.mask\n";
	mask.define(ViewManagerCompo, Template);
	//# sourceMappingURL=exports.es6.map
	// end:source Controls/exports.es6
	// source View.es6
	'use strict';

	var ViewCompo;
	(function () {

		var view_NONE = 1;
		var view_DETACHED = 2;
		var view_ATTACHED = 3;
		var view_VISIBLE = 4;
		var view_HIDDEN = 5;

		ViewCompo = Compo({
			meta: {
				attributes: {
					'default': false,
					'display': {
						description: 'Hides view when not visible',
						default: false,
						type: 'boolean'
					},
					'detach': true,
					'recycle': false
				}
			},
			slots: {
				viewDeactivation: function viewDeactivation() {
					if (this.state === view_HIDDEN) {
						return false;
					}
					this.state = view_HIDDEN;
				}
			},
			tagName: 'div',
			attr: {
				class: 'v-view'
			},
			onRenderStart: function onRenderStart() {},

			state: view_NONE,
			hide_: function hide_() {
				var _this = this;

				return this.hide().then(function () {
					if (_this.xRecycle === true) {
						_this.remove();
						return;
					}
					if (_this.xDetach === true) {
						_this.state = view_DETACHED;
						var fn = _this.$.detach || _this.$.remove;
						fn.call(_this.$);
					}
				});
			},
			show_: function show_() {
				if (this.state <= view_ATTACHED) {
					this.parent.$.append(this.$);
				}
				if (this.state === view_NONE) {
					this.emitIn('domInsert');
					this.state = view_ATTACHED;
				}
				return this.show();
			},
			hide: function hide() {
				var isVisible = this.xDisplay ? view_VISIBLE : view_HIDDEN;
				if (isVisible === false) {
					this.$.hide();
				}
				return new mask.class.Deferred().resolve();
			},
			show: function show() {
				var isVisible = this.xDisplay ? view_VISIBLE : view_HIDDEN;
				if (isVisible === false) {
					this.$.show();
				}
				return new mask.class.Deferred().resolve();
			}
		});

		mask.define(ViewManagerCompo, 'View', ViewCompo);
	})();
	//# sourceMappingURL=View.es6.map
	// end:source View.es6
	//# sourceMappingURL=ViewManager.es6.map
	// end:source compo/ViewManager.es6
	mask.registerHandler('ViewManager', ViewManagerCompo);
});
//# sourceMappingURL=umd.es6.map
// end:source /src/umd.es6