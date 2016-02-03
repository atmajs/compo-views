// source /src/umd.es6
/*!
 * Form Component v0.10.17
 * Part of the Atma.js Project
 * http://atmajs.com/
 *
 * MIT license
 * http://opensource.org/licenses/MIT
 *
 * (c) 2012, 2016 Atma.js and other contributors
 */
"use strict";

(function (root, factory) {
	var _global = typeof global !== "undefined" ? global : window,
	    _mask = _global.mask || _global.atma && _global.atma.mask;

	if (_mask == null) {
		if (typeof require === "function") {
			mask = require("maskjs");
		} else {
			throw Error("MaskJS was not loaded");
		}
	}
	factory(_global, _mask, _mask.jmask, _mask.Compo, _mask.Compo.config.getDOMLibrary());
})(undefined, function (global, mask, j, Compo, $) {

	// source utils/obj.es6
	"use strict";

	var obj_toFlatObject, obj_getType, obj_clone;
	(function () {

		obj_getType = function (obj) {
			return Object.prototype.toString.call(obj).replace("[object ", "").replace("]", "");
		};

		(function () {
			obj_clone = function (obj) {
				if (obj == null || typeof obj !== "object") return obj;

				var type = obj_getType(obj),
				    clone;

				if ("Date" === type) {
					return new Date(obj);
				}
				if ("Array" === type) {
					clone = [];
					var i = -1,
					    imax = obj.length;
					while (++i < imax) {
						clone[i] = obj_clone(obj[i]);
					}
					return clone;
				}
				if ("Object" === type) {
					clone = {};
					for (var key in obj) {
						clone[key] = obj_clone(obj[key]);
					}
					return clone;
				}
				return obj;
			};
		})();

		obj_toFlatObject = function (mix, prefix) {
			var out = arguments[2] === undefined ? {} : arguments[2];

			if (mix == null) return out;

			var type = obj_getType(mix);

			if ("Array" === type) {
				mix.forEach(function (x, i) {
					obj_toFlatObject(x, prefix + "[" + i + "]", out);
				});
				return out;
			}

			if ("Object" === type) {
				if (prefix) prefix += ".";

				var key, x, prop;
				for (key in mix) {
					x = mix[key];
					prop = prefix + key;

					if (x == null) continue;

					var type = obj_getType(x);
					switch (type) {
						case "Object":
						case "Array":
							obj_toFlatObject(x, prop, out);
							continue;
						case "String":
						case "Number":
						case "Boolean":
						case "Blob":
						case "File":
							if (prop in out) {
								console.warn("ToFormData: Overwrite property", prop);
							}
							out[prop] = x;
							continue;
						case "Date":
							out[prop] = x.toISOString();
							continue;
						default:
							console.error("Possible type violation", type);
							out[prop] = x;
							continue;
					}
				}
				return out;
			}

			switch (type) {
				case "Date":
					mix = mix.toISOString();
					break;
				case "String":
				case "Number":
				case "Boolean":
				case "Blob":
				case "File":
					break;
				default:
					console.error("Possible type violation", type);
					break;
			}

			if (prefix in out) {
				console.warn("ToFormData: Overwrite property", prefix);
			}
			out[prefix] = mix;
			return out;
		};
	})();
	//# sourceMappingURL=obj.es6.map
	// end:source utils/obj.es6
	// source utils/compo.es6
	"use strict";

	var compo_walk;
	(function () {

		compo_walk = function (root, fn) {
			mask.TreeWalker.walk(root, function (compo) {
				if (compo === root) {
					return;
				}
				return fn(compo);
			});
		};
	})();
	//# sourceMappingURL=compo.es6.map
	// end:source utils/compo.es6
	// source utils/path.es6
	"use strict";

	var path_interpolate, path_hasInterpolation, path_getCurrent;
	(function () {

		path_getCurrent = function (ctx) {
			return mask.obj.get(ctx, "req.url") || global.location.pathname + global.location.search;
		};
	})();
	//# sourceMappingURL=path.es6.map
	// end:source utils/path.es6

	// source class/ViewData.es6
	"use strict";

	var ViewState = {
		NONE: 0,
		LOADING: 1,
		LOADED: 2,
		RENDERING: 3,
		RENDERED: 4
	};

	var ViewData = mask["class"].create({
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
		"default": false,
		constructor: function constructor() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

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
		getNodes: function getNodes() {
			return this.viewNode || this.nodes || mask.parse("import from '" + this.path + "'");
		}
	});

	var ViewMap = {
		ensure: function ensure(viewManager, model, ctx) {
			var viewmap = viewManager.viewmap;
			if (viewmap != null) {
				return viewmap;
			}
			var fn = mask.Utils.Expression.eval;
			viewmap = viewManager.scope.viewmap || viewManager.xViewmap && fn(viewManager.xViewmap, model, ctx, viewManager) || {};
			mask.jmask(viewManager.nodes).filter("View").map(ViewMap.createViewDataFromNode).each(function (x) {
				viewmap[x.route] = new ViewData(viewmap[x.route], x);
			});

			return viewManager.viewmap = viewmap;
		},
		createRoutes: function createRoutes(viewManager) {
			for (var key in viewManager.viewmap) {
				viewManager.routes.add(key, viewManager.viewmap[key]);
			}
		},
		createViewDataFromNode: function createViewDataFromNode(viewNode) {
			return new ViewData({
				viewNode: viewNode,
				route: viewNode.attr.route,
				path: viewNode.attr.path,
				"default": Boolean(viewNode.attr["default"]) });
		},
		getRouteByPath: function getRouteByPath(viewManager, path) {
			var routes = viewManager.routes,
			    route = routes.get(path);
			if (route) {
				return route;
			}
			var viewmap = viewManager.viewmap;
			for (var key in viewmap) {
				if (viewmap[key]["default"] === true) {
					return routes.get(key);
				}
			}
			return null;
		},
		bindRouter: function bindRouter(viewManager, model, ctx) {
			var viewmap = ViewMap.ensure(viewManager, model, ctx);
			if (viewmap == null) {
				console.error("Viewmap is undefined");
				return;
			}
			for (var key in viewmap) {
				ruta.add(key, function (route) {
					viewManager.navigate(route.current.path);
				});
			}
		}
	};
	//# sourceMappingURL=ViewData.es6.map
	// end:source class/ViewData.es6
	// source class/ActivityTracker.es6
	"use strict";

	var ActivityTracker;
	(function () {
		ActivityTracker = mask["class"].create(Object.defineProperties({
			tickStart: null,
			tickEnd: null,
			constructor: function constructor(viewManager) {
				this.history = [];
				this.routes = [];
				this.vm = viewManager;
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

				this.history.push(route);
				this.requestProgressStart();
				return dfr.done(function () {
					return _this.requestProgressEnd(route);
				});
			},
			requestProgressStart: function requestProgressStart(route) {
				this.cancelProgressEnd();
				this.tickStart = setTimeout(this.progressStart.bind(this, route));
			},
			requestProgressEnd: function requestProgressEnd(route) {
				this.cancelProgressStart();
				this.tickEnd = setTimeout(this.progressEnd.bind(this, route));
			},
			cancelProgressStart: function cancelProgressStart() {
				clearTimeout(this.tickStart);
			},
			cancelProgressEnd: function cancelProgressEnd() {
				clearTimeout(this.tickEnd);
			},
			progressStart: function progressStart() {
				this.cancelProgressEnd();
				this.vm.emitIn("viewActivity", "start");
			},
			progressEnd: function progressEnd(route) {
				if (route != null && this.current !== route) {
					return;
				}
				this.cancelProgressStart();
				this.cancelProgressEnd();
				this.vm.emitIn("viewActivity", "end");
			},
			history: null,
			active: false,
			route: null,
			tick: null,
			vm: null }, {
			current: {
				get: function get() {
					return this.history[this.history.length - 1];
				},
				configurable: true,
				enumerable: true
			}
		}));
	})();
	//# sourceMappingURL=ActivityTracker.es6.map
	// end:source class/ActivityTracker.es6

	// source class/Message.es6
	"use strict";

	var Message = mask["class"].create(Object.defineProperties({
		body: null,
		headers: null,
		method: "POST",
		endpoint: window.location.href,
		contentType: "application/json",

		constructor: function constructor(body) {
			var params = arguments[1] === undefined ? {} : arguments[1];

			this.body = body;
			this.headers = params.headers;

			if (params.endpoint) this.endpoint = params.endpoint;
			if (params.method) this.method = params.method;
			if (params.contentType) this.contentType = params.contentType;
		},
		serializeHeaders: function serializeHeaders() {
			var obj = {};
			if (this.isFormData_() === false) {
				obj["Content-Type"] = this.contentType;
			}
			return mask.obj.extend(obj, this.headers);
		},
		serialize: function serialize() {
			if (this.body == null) {
				return null;
			}
			if (this.isFormData_()) {
				return this.formData;
			}
			return JSON.stringify(this.body);
		},

		isFormData_: function isFormData_() {
			return /form-data/i.test(this.contentType);
		}
	}, {
		formData: {
			get: function get() {
				var form = new global.FormData();
				form_append(form, this.body);
				return form;
			},
			configurable: true,
			enumerable: true
		}
	}));
	//# sourceMappingURL=Message.es6.map
	// end:source class/Message.es6
	// source class/ValidationError.es6
	"use strict";

	var ValidationError = mask["class"].createError("ValidationError", {
		constructor: function constructor(error) {
			if (error != null && typeof error === "object") {
				this.message = error.message || error.error || String(error);
			}
		},
		message: ""
	});
	//# sourceMappingURL=ValidationError.es6.map
	// end:source class/ValidationError.es6
	// source class/HttpError.es6
	"use strict";

	var HttpError = mask["class"].createError("HttpError", {
		status: 500,
		message: "",
		constructor: function constructor(message, status) {
			this.status = status;
			this.message = message;
		}
	});
	//# sourceMappingURL=HttpError.es6.map
	// end:source class/HttpError.es6

	// source partial/Transport.es6
	"use strict";

	var Transport;
	(function () {
		Transport = {
			getJson: function getJson(url) {
				return new Xhr(url, "GET").send();
			},
			getGetterEndpoint: function getGetterEndpoint(formCompo, model) {
				var xGet = formCompo.xGet;
				var endpoint = xGet === "get" || xGet === true ? formCompo.xAction : xGet;

				return path_interpolate(endpoint, model);
			},
			send: function send(message) {
				var endpoint = message.endpoint;
				var method = message.method;

				var body = message.serialize();
				var xhr = new Xhr(endpoint, method);

				return xhr.write(message.serialize()).writeHeaders(message.serializeHeaders()).send();
			}
		};
	})();
	//# sourceMappingURL=Transport.es6.map
	// end:source partial/Transport.es6
	// source partial/Validation.es6
	"use strict";

	var Validation;
	(function () {
		Validation = {
			process: function process(formCompo) {
				var error;
				compo_walk(formCompo, function (compo) {

					var name = compo.compoName;
					if (name === ":dualbind" || name === "dualbind") {
						error = compo.provider.validate();
						if (error) {
							return { "break": true };
						}
					}

					var fn = compo.validateUi || compo.validate;
					if (fn != null) {
						error = fn.call(compo);
						if (error) {
							return { "break": true };
						}
					}
				});
				return error;
			}
		};
	})();
	//# sourceMappingURL=Validation.es6.map
	// end:source partial/Validation.es6
	// source partial/Builder.es6
	"use strict";

	var _defineProperty = function _defineProperty(obj, key, value) {
		return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
	};

	var Builder;
	(function () {
		Builder = {
			createMessage: function createMessage(formCompo) {
				var params = arguments[1] === undefined ? {} : arguments[1];

				var body = this.getJson(formCompo),
				    contentType = params.contentType || formCompo.xContentType,
				    endpoint = params.action || formCompo.xAction,
				    method = params.method || formCompo.xMethod;

				var key = path_getKey(endpoint);
				if (key) {
					endpoint = path_interpolate(endpoint, body);
					if (body[key] != null) {
						method = params.methodEdit || formCompo.xMethodEdit;
					}
				}
				return new Message(body, {
					contentType: contentType,
					endpoint: endpoint,
					method: method
				});
			},
			createDeleteMessage: function createDeleteMessage(formCompo, model) {
				var endpoint = formCompo.xAction,
				    contentType = formCompo.xContentType,
				    method = "DELETE";

				var key = path_getKey(endpoint);
				if (key) {
					if (model[key] == null) {
						throw Error("`DELETE` method expects key in the model");
					}
					endpoint = path_interpolate(endpoint, model);
				}
				return new Message(null, {
					contentType: contentType,
					endpoint: endpoint,
					method: method
				});
			},
			getJson: (function (_getJson) {
				var _getJsonWrapper = function getJson(_x) {
					return _getJson.apply(this, arguments);
				};

				_getJsonWrapper.toString = function () {
					return _getJson.toString();
				};

				return _getJsonWrapper;
			})(function (formCompo) {
				var json = obj_clone(getJson(formCompo));
				var transformed = formCompo.transformData(json);
				if (transformed != null) {
					json = transformed;
				}
				return json;
			})
		};

		function getJson(formCompo) {
			var entity = formCompo.model.entity,
			    model = toJson(entity, true),
			    data = mask.obj.extend({}, model);

			compo_walk(formCompo, function (compo) {
				var json = toJson(compo, false);
				if (json) {
					var property = compo.attr && compo.attr.property;
					if (property) {
						json = _defineProperty({}, property, json);
					}
					mask.obj.extend(data, json);
					return { deep: false };
				}
			});
			return data;
		}

		function toJson(mix, isSelf) {
			if (mix == null) {
				return null;
			}
			var fn = mix.toJson || mix.toJSON;
			if (fn == null) {
				return isSelf ? mix : null;
			}
			return fn.call(mix);
		}
	})();
	//# sourceMappingURL=Builder.es6.map
	// end:source partial/Builder.es6

	// source compo/ViewManager.es6
	"use strict";

	var ViewManagerCompo = mask.Compo({
		tagName: "div",
		attr: {
			style: "position: relative",
			"class": "v-manager" },

		meta: {
			attributes: {
				base: "",
				viewmap: "",
				routing: true
			}
		},

		slots: {},

		scope: {
			notificationMsg: "",
			notificationType: ""
		},

		viewmap: null,
		routes: null,
		route: null,
		next: null,

		activity: function activity(type) {
			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}

			this.emitIn.apply(this, ["views:activity", type].concat(args));
		},

		constructor: function constructor() {
			this.routes = new ruta.Collection();
		},

		onRenderStart: function onRenderStart(model, ctx) {
			ViewMap.ensure(this, model, ctx);
			ViewMap.createRoutes(this);

			var path = path_getCurrent(ctx);
			var route = ViewMap.getRouteByPath(this, path);

			this.route = route;
			this.nodes = route && route.value.getNodes();
			this.ensureCompo_("Notification");
			this.ensureCompo_("Progress");
			this.attr.path = path;
		},
		onRenderEnd: function onRenderEnd(elements, model, ctx) {
			var _this = this;

			this.activityTracker = new ActivityTracker(this);

			ViewMap.ensure(this, model, ctx);
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
			viewData.compo = this.find("View");
			if (viewData.compo != null) {
				viewData.compo.emitIn("viewActivation");
			}
			this.activityTracker.show(this.route, function () {
				return Compo.await(_this);
			});
		},
		navigate: function navigate(path) {
			var _this = this;

			var route = ViewMap.getRouteByPath(this, path);
			if (route == null) {
				return new mask["class"].Deferred().reject("View not found: " + path);
			}
			return this.activityTracker.show(route, function () {
				return _this.renderView(route);
			}).done(function () {
				return _this.performShow(route);
			});
		},

		hideCompo_: function hideCompo_(compo) {
			if (compo == null) {
				return;
			}compo.emitIn("viewDeactivation", this);
			compo.hide_();
		},

		showCompo_: function showCompo_(compo) {
			if (compo == null) {
				return;
			}compo.emitIn("viewActivation", this);
			compo.show_();
		},

		emit: function emit(type) {
			var _Compo$pipe;

			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}

			(_Compo$pipe = Compo.pipe("views")).emit.apply(_Compo$pipe, [type, this].concat(args));
		},

		activate: function activate(route) {
			compo.emitIn("viewActivation", route.current.params);
		},

		renderView: function renderView(route) {
			var _this = this;

			return mask["class"].Deferred.run(function (resolve, reject, dfr) {
				if (route.value.compo) {
					resolve(route);
					return;
				}
				var params = route.current && route.current.params;
				mask.renderAsync(route.value.getNodes(), { params: params }, null, null, _this).done(function (frag, compo) {
					var last = compo.components[compo.components.length - 1];
					var view = Compo.prototype.find.call(last, "View");
					route.value.compo = view;
					resolve(route);
				});
			});
		},
		performShow: function performShow(route) {
			var current = this.route;
			if (current === route) {
				return;
			}
			this.route = route;
			this.hideCompo_(current.value.compo);
			this.showCompo_(route.value.compo);
		},

		notify: function notify(type, message) {
			if (arguments.length === 0) {
				type = message = "";
			}
			this.scope.notificationType = type;
			this.scope.notificationMsg = message;
			this.emitIn("formNotification", { type: type, message: message });
		},

		ensureCompo_: function ensureCompo_(name) {
			var set = jmask(this).children(name);
			if (set.length !== 0) {
				return;
			}
			jmask(this).prepend(name);
		},

		throw_: function throw_(error) {
			this.nodes = mask.parse("\n\t\t\tdiv style='background: red; color: white; padding: 15px; font-weight: bold' {\n\t\t\t\t\"" + error.message + "\"\n\t\t\t}\n\t\t");
		},

		errored_: function errored_(error) {
			this.activity("end");
			this.activity("error", error);
			this.notify("danger", error.message || String(error));
		}
	});

	// source Controls/exports.es6
	"use strict";

	var Template = "\n\t// source Notification.mask\n\tlet Notification as (div) {\n\t\t\n\t\tslot formNotification () {\n\t\t\tvar form = this.closest('a:form');\n\t\t\tif (!form.scope.notificationMsg) {\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tvar el = this.$.get(0);\n\t\t\tif (el) {\n\t\t\t\tel.scrollIntoView(true);\n\t\t\t}\n\t\t}\n\t\t\n\t\t@if (template) {\n\t\t\t@template;\n\t\t}\n\t\t@else {\n\t\t\t+if (notificationMsg) {\n\t\t\t\t.alert.alert-~[bind: $scope.notificationType] > '~[bind: $scope.notificationMsg ]'\n\t\t\t}\n\t\t}\n\t}\n\t// end:source Notification.mask\n\t// source Progress.mask\n\tlet Progress {\n\t\tvar value = -1;\n\t\tvar progress = false;\n\t\n\t\tslot viewActivity (sender, type, percent) {\n\t\t\tif (type === 'start') {\n\t\t\t\tthis.scope.progress = true;\n\t\t\t}\n\t\t\tif (type === 'end') {\n\t\t\t\tthis.scope.progress = false;\n\t\t\t}\n\t\t\tif (type === 'progress' && typeof percent === 'number') {\n\t\t\t\tthis.scope.value = percent;\n\t\t\t}\n\t\t}\n\t\n\t\t.-a-views-progress style='display: ~[bind: $scope.progress ? \"block\" : \"none\" ]'{\n\t\n\t\t\tprogress value='~[bind: $scope.value == -1 ? null : $scope.value]' max=100;\n\t\n\t\t\tstyle scoped {\n\t\t\t\tprogress {\n\t\t\t\t\tdisplay: block;\n\t\t\t\t\tmargin: auto;\n\t\t\t\t\twidth: 98%;\n\t\t\t\t\theight: 3px;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\t// end:source Progress.mask\n";
	mask.define(ViewManagerCompo, Template);
	//# sourceMappingURL=exports.es6.map
	// end:source Controls/exports.es6
	// source View.es6
	"use strict";

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
					"default": false,
					detach: true
				}
			},
			tagName: "div",
			attr: {
				"class": "v-view",
				style: "position:relative"
			},
			onRenderStart: function onRenderStart() {},
			state: view_NONE,
			hide_: function hide_() {
				var _this = this;

				this.hide().then(function () {
					if (_this.xDetach === true) {
						_this.$.remove();
					}
				});
			},
			show_: function show_() {
				if (this.state < view_ATTACHED) {
					this.parent.$.append(this.$);
				}
				this.show();
			},
			hide: function hide() {
				this.$.hide();
				return new mask["class"].Deferred().resolve();
			},
			show: function show() {
				this.$.show();
				return new mask["class"].Deferred().resolve();
			}
		});

		mask.define(ViewManagerCompo, "View", ViewCompo);
	})();
	//# sourceMappingURL=View.es6.map
	// end:source View.es6
	//# sourceMappingURL=ViewManager.es6.map
	// end:source compo/ViewManager.es6
	mask.registerHandler("ViewManager", ViewManagerCompo);
});
//# sourceMappingURL=umd.es6.map
// end:source /src/umd.es6