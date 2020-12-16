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

    var _src_class_ActivityTracker = {};
var _src_class_ViewChanger = {};
var _src_class_ViewData = {};
var _src_class_ViewMap = {};
var _src_compo_Controls_exports = {};
var _src_compo_View = {};
var _src_compo_ViewManager = {};
var _src_utils_path = {};

// source ./ModuleSimplified.js
var _src_utils_path;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = {};
    var module = { exports: exports };
    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.path_getCurrent = void 0;
function path_getCurrent(ctx) {
    return mask.obj.get(ctx, 'req.url') || ruta.currentPath();
}
exports.path_getCurrent = path_getCurrent;
;
;

    function isObject(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (isObject(_src_utils_path) && isObject(module.exports)) {
        Object.assign(_src_utils_path, module.exports);
    } else {
        _src_utils_path = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_class_ViewData;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = {};
    var module = { exports: exports };
    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewData = exports.ViewState = void 0;
exports.ViewState = {
    NONE: 0,
    LOADING: 1,
    LOADED: 2,
    RENDERING: 3,
    RENDERED: 4
};
var ViewData = /** @class */ (function () {
    function ViewData() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.viewNode = null;
        this.nodes = null;
        this.compo = null;
        this.route = null;
        this.state = exports.ViewState.NONE;
        this.path = null;
        /*
         * View is shown when no route is matched, otherwise viewManager decides
         * whether to hide everything, or to show an error
         */
        this.default = null;
        /** When default view is shown, also rewrite the current location */
        this.navigateDefault = null;
        var imax = args.length, i = -1;
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
    }
    ViewData.prototype.getNodes = function () {
        if (this.viewNode != null) {
            if (this.path != null && this.viewNode.nodes == null) {
                this.viewNode.nodes = mask.parse("import from '" + this.path + "'");
            }
            return this.viewNode;
        }
        if (this.nodes == null && this.path != null) {
            return (this.nodes = mask.parse("import from '" + this.path + "'"));
        }
        return this.nodes;
    };
    ViewData.prototype.toJSON = function () {
        return {
            route: this.route,
            state: this.state,
            path: this.path,
            viewNode: this.viewNode ? mask.stringify(this.viewNode) : null,
            nodes: this.nodes ? mask.stringify(this.nodes) : null,
        };
    };
    ViewData.prototype.createViewNode = function (nodes) {
        var $ = mask.j(nodes);
        if (this.hasView_($) === false) {
            var container = this.viewNode || mask.j('View');
            this.viewNode = mask.j(container).append(nodes);
            return;
        }
        this.viewNode = $[0];
    };
    ViewData.prototype.hasView_ = function ($nodes) {
        if ($nodes.length !== 1) {
            return false;
        }
        // Any Component supposed to be an IView
        var name = $nodes.tag();
        if (name[0] === name[0].toUpperCase()) {
            return true;
        }
        return false;
    };
    ViewData.createFromNode = function (viewNode) {
        return new ViewData({
            viewNode: viewNode,
            route: viewNode.attr.route,
            path: viewNode.attr.path,
            'default': viewNode.attr['default'],
            navigateDefault: viewNode.attr['navigateDefault'],
        });
    };
    ;
    ViewData.createFromObj = function (data) {
        return new ViewData({
            route: data.route,
            path: data.path || data.view,
            'default': data['default'],
            navigateDefault: data['navigateDefault'],
        });
    };
    ;
    return ViewData;
}());
exports.ViewData = ViewData;
;
;

    function isObject(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (isObject(_src_class_ViewData) && isObject(module.exports)) {
        Object.assign(_src_class_ViewData, module.exports);
    } else {
        _src_class_ViewData = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_class_ViewMap;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = {};
    var module = { exports: exports };
    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewMap = void 0;
var ViewData_1 = _src_class_ViewData;
var ViewMap = /** @class */ (function () {
    function ViewMap() {
        this.views = [];
    }
    ViewMap.prototype.add = function (viewData) {
        this.views.push(viewData);
    };
    ViewMap.prototype.each = function (fn) {
        var imax = this.views.length, i = -1;
        while (++i < imax)
            fn(this.views[i]);
    };
    ViewMap.prototype.toJSON = function () {
        return this.views.map(function (x) { return x.toJSON(); });
    };
    ViewMap.ensure = function (viewManager, model, ctx) {
        var viewmap = viewManager.viewmap;
        if (viewmap != null) {
            return viewmap;
        }
        viewmap = new ViewMap;
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
                .map(ViewData_1.ViewData.createFromObj)
                .forEach(function (x) {
                viewmap.add(new ViewData_1.ViewData(viewmap[x.route], x));
            });
        }
        else if (mask.is.Object(scoped)) {
            var obj = scoped;
            for (var key in obj) {
                var entry = obj[key];
                if (entry.route == null) {
                    entry.route = key;
                }
                viewmap.add(ViewData_1.ViewData.createFromObj(entry));
            }
        }
        mask
            .jmask(viewManager.nodes)
            .filter('View')
            .map(ViewData_1.ViewData.createFromNode)
            .each(function (x) {
            viewmap.add(new ViewData_1.ViewData(viewmap[x.route], x));
        });
        return (viewManager.viewmap = viewmap);
    };
    ViewMap.getFromRoutes = function (vm, ctx) {
        if (ctx.page == null || ctx.config == null) {
            return null;
        }
        var current = ctx.page.data, pages = ctx.config.pages, key, page, arr = [];
        for (key in pages) {
            page = pages[key];
            if (page.template === current.template) {
                arr.push(page);
            }
        }
        return arr;
    };
    ViewMap.createRoutes = function (viewManager) {
        var viewmap = viewManager.viewmap, views = viewmap.views, imax = views.length, i = -1;
        while (++i < imax) {
            var view = views[i];
            viewManager.routes.add(view.route, view);
        }
    };
    ViewMap.getRouteByPathOrDefault = function (viewManager, path) {
        var routes = viewManager.routes;
        var route = routes.get(path);
        if (route) {
            return { route: route, isDefault: false };
        }
        var viewmap = viewManager.viewmap, views = viewmap.views, imax = views.length, i = -1;
        while (++i < imax) {
            var view = views[i];
            var d = view.default;
            if (!d) {
                continue;
            }
            var path_1 = view.route;
            if (typeof d === 'string' && d !== 'true' && d !== 'false' && d !== 'default') {
                path_1 = d;
            }
            var route_1 = routes.get(path_1);
            if (route_1.definition.indexOf('?') > -1) {
                ruta.navigate(route_1.definition, {
                    extend: true,
                    silent: true,
                    replace: true
                });
            }
            return { route: route_1, isDefault: true };
        }
        return { route: null, isDefault: false };
    };
    ViewMap.getRouteByPathOrCurrentOrDefault = function (viewManager, path, params) {
        var routes = viewManager.routes, route = routes.get(path), fromPath = route != null;
        if (route == null) {
            route = viewManager.route;
        }
        else {
            obj_default(route.current.params, params);
        }
        if (route == null) {
            var viewmap = viewManager.viewmap, views = viewmap.views, imax = views.length, i = -1;
            while (++i < imax) {
                var view = views[i];
                var d = view.default;
                if (!d) {
                    continue;
                }
                var path_2 = view.route;
                if (typeof d === 'string' && d !== 'true' && d !== 'false' && d !== 'default') {
                    path_2 = d;
                }
                route = routes.get(path_2);
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
        viewmap.each(function (view) {
            ruta.add(view.route, function (route) {
                var current = route.current, path = current.path, params = current.params;
                viewManager.navigate(path, null, { params: params });
            });
        });
    };
    ;
    return ViewMap;
}());
exports.ViewMap = ViewMap;
;
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
;

    function isObject(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (isObject(_src_class_ViewMap) && isObject(module.exports)) {
        Object.assign(_src_class_ViewMap, module.exports);
    } else {
        _src_class_ViewMap = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_compo_Controls_exports;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = {};
    var module = { exports: exports };
    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlsTemplates = void 0;
exports.ControlsTemplates = "\n  // import Notification.mask\n  // import Progress.mask\n";
;

    function isObject(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (isObject(_src_compo_Controls_exports) && isObject(module.exports)) {
        Object.assign(_src_compo_Controls_exports, module.exports);
    } else {
        _src_compo_Controls_exports = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_compo_View;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = {};
    var module = { exports: exports };
    "use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewCompo = void 0;
var view_NONE = 1;
var view_DETACHED = 2;
var view_ATTACHED = 3;
var view_VISIBLE = 4;
var view_HIDDEN = 5;
var ViewCompo = /** @class */ (function (_super) {
    __extends(ViewCompo, _super);
    function ViewCompo() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.xDefault = '';
        // Hides view when not visible
        _this.xDisplay = false;
        _this.xDetach = true;
        _this.xRecycle = false;
        _this.tagName = 'div';
        _this.attr = {
            class: 'v-view'
        };
        _this.state = view_NONE;
        return _this;
    }
    // meta: {
    //     attributes: {
    //         'default': {
    //             default: '',
    //             type: 'string'
    //         },
    //         'display': {
    //             description: 'Hides view when not visible',
    //             default: false,
    //             type: 'boolean'
    //         },
    //         'detach': true,
    //         'recycle': false,
    //     }
    // },
    ViewCompo.prototype.viewDeactivation = function () {
        if (this.state === view_HIDDEN) {
            return false;
        }
        this.state = view_HIDDEN;
    };
    ViewCompo.prototype.onRenderStart = function () {
    };
    ViewCompo.prototype.hide_ = function () {
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
    };
    ViewCompo.prototype.show_ = function () {
        if (this.state <= view_ATTACHED) {
            this.parent.$.append(this.$);
        }
        if (this.state === view_NONE) {
            this.emitIn('domInsert');
            this.state = view_ATTACHED;
        }
        return this.show();
    };
    ViewCompo.prototype.hide = function () {
        // let isVisible = this.display
        //     ? view_VISIBLE
        //     : view_HIDDEN;
        // if (isVisible === view_HIDDEN) {
        //     this.$.hide();
        // }
        return (new mask.class.Deferred()).resolve();
    };
    ViewCompo.prototype.show = function () {
        // let isVisible = this.display
        //     ? view_VISIBLE
        //     : view_HIDDEN;
        // if (isVisible === view_VISIBLE) {
        //     this.$.show();
        // }
        return (new mask.class.Deferred()).resolve();
    };
    __decorate([
        mask.deco.attr({ default: '', type: 'string', name: 'default' })
    ], ViewCompo.prototype, "xDefault", void 0);
    __decorate([
        mask.deco.attr({ default: false, type: 'boolean', name: 'display' })
    ], ViewCompo.prototype, "xDisplay", void 0);
    __decorate([
        mask.deco.attr({ default: true, type: 'boolean', name: 'detach' })
    ], ViewCompo.prototype, "xDetach", void 0);
    __decorate([
        mask.deco.attr({ default: false, type: 'boolean', name: 'recycle' })
    ], ViewCompo.prototype, "xRecycle", void 0);
    __decorate([
        mask.deco.slot()
    ], ViewCompo.prototype, "viewDeactivation", null);
    return ViewCompo;
}(mask.Component));
exports.ViewCompo = ViewCompo;
;
;

    function isObject(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (isObject(_src_compo_View) && isObject(module.exports)) {
        Object.assign(_src_compo_View, module.exports);
    } else {
        _src_compo_View = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_class_ViewChanger;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = {};
    var module = { exports: exports };
    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewChanger = void 0;
var ViewChanger = /** @class */ (function () {
    function ViewChanger(viewManager) {
        this.vm = null;
        this.vm = viewManager;
    }
    ViewChanger.prototype.show = function (route, prevRoute, isInitial) {
        var _this = this;
        var show = this.getShow(route, prevRoute);
        var hide = this.getHide(prevRoute, route);
        if (show.parallel) {
            this.hide_(hide, prevRoute);
            this.show_(show, route, isInitial);
            return;
        }
        this
            .hide_(hide, prevRoute)
            .then(function () { return _this.show_(show, route, isInitial); });
    };
    ViewChanger.prototype.show_ = function (ani, route, isInitial) {
        var _this = this;
        return mask.class.Deferred.run(function (resolve) {
            _this
                .vm
                .showCompo_(route.value.compo, isInitial)
                .then(function () {
                var el = route.value.compo.$[0];
                ani.start(resolve, el, { route: route, isInitial: isInitial });
            });
        });
    };
    ViewChanger.prototype.hide_ = function (ani, route) {
        var _this = this;
        return mask.class.Deferred.run(function (resolve) {
            if (route.value.compo == null) {
                resolve();
                return;
            }
            ani.start(function () {
                _this.vm.hideCompo_(route.value.compo).then(resolve);
            }, route.value.compo.$[0], { route: route });
        });
    };
    ViewChanger.prototype.getShow = function (route, beforeRoute) {
        return this.getAniForRoute(route, 'show', beforeRoute);
    };
    ViewChanger.prototype.getHide = function (route, nextRoute) {
        return this.getAniForRoute(route, 'hide', nextRoute);
    };
    ViewChanger.prototype.getAniForCompo = function (compo, id, pairedRouteDefinition) {
        return findAnimation(compo, id, pairedRouteDefinition);
    };
    ViewChanger.prototype.getAniForRoute = function (route, id, anchorRoute) {
        var pairedDef = anchorRoute.definition;
        var ani = this.getAniForCompo(route.value.compo, id, pairedDef);
        if (ani == null) {
            ani = this.getAniForCompo(this.vm, id, pairedDef);
        }
        return ani ? ani : Default;
    };
    return ViewChanger;
}());
exports.ViewChanger = ViewChanger;
;
var Default = {
    attr: {},
    start: function (cb) {
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
    var imax = compos.length, i = -1, default_ = null;
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
;

    function isObject(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (isObject(_src_class_ViewChanger) && isObject(module.exports)) {
        Object.assign(_src_class_ViewChanger, module.exports);
    } else {
        _src_class_ViewChanger = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_class_ActivityTracker;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = {};
    var module = { exports: exports };
    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityTracker = void 0;
var ActivityTracker = /** @class */ (function () {
    function ActivityTracker(viewManager) {
        this.tickStart = null;
        this.tickEnd = null;
        this.vm = null;
        this.history = [];
        this.routes = [];
        this.activityCounter = 0;
        this.isBusy = false;
        this.vm = viewManager;
    }
    ActivityTracker.prototype.show = function (route, loaderFn) {
        var _this = this;
        var i = this.routes.indexOf(route), dfr;
        if (i === -1) {
            route.dfr = dfr = loaderFn();
            this.routes.push(route);
        }
        else {
            dfr = this.routes[i].dfr;
        }
        this.history.push({ current: route.current, route: route });
        this._requestProgressStart();
        return dfr
            .done(function () { return _this._requestProgressEnd(route); })
            .fail(function (error) { return console.error(error); });
    };
    ActivityTracker.prototype.clear = function (route) {
        var i = this.routes.indexOf(route);
        if (i === -1)
            return;
        route.dfr = null;
        route.value.compo = null;
        this.routes.splice(i, 1);
    };
    ActivityTracker.prototype._requestProgressStart = function (route) {
        this._activity(1, route);
    };
    ActivityTracker.prototype._requestProgressEnd = function (route) {
        this._activity(-1, route);
    };
    ActivityTracker.prototype._cancelProgressStart = function () {
        clearTimeout(this.tickStart);
    };
    ActivityTracker.prototype._cancelProgressEnd = function () {
        clearTimeout(this.tickEnd);
    };
    ActivityTracker.prototype._progressStart = function (route) {
        this._cancelProgressStart();
        this._cancelProgressEnd();
        this.isBusy = true;
        this.vm.emitIn('viewActivity', 'start');
    };
    ActivityTracker.prototype._progressEnd = function (route) {
        // if (route != null && this.current !== route) {
        //     return;
        // }
        this._cancelProgressStart();
        this._cancelProgressEnd();
        this.isBusy = false;
        this.vm.emitIn('viewActivity', 'end');
    };
    ActivityTracker.prototype._activity = function (val, route) {
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
        }
        else {
            this.tickEnd = setTimeout(this._progressEnd.bind(this, route));
        }
    };
    Object.defineProperty(ActivityTracker.prototype, "current", {
        get: function () {
            var track = this.history[this.history.length - 1];
            return track && track.route;
        },
        enumerable: false,
        configurable: true
    });
    ActivityTracker.prototype.back = function () {
        this.history.pop();
        return this.history.pop();
    };
    return ActivityTracker;
}());
exports.ActivityTracker = ActivityTracker;
;
;

    function isObject(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (isObject(_src_class_ActivityTracker) && isObject(module.exports)) {
        Object.assign(_src_class_ActivityTracker, module.exports);
    } else {
        _src_class_ActivityTracker = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_compo_ViewManager;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = {};
    var module = { exports: exports };
    "use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewManagerCompo = void 0;
var path_1 = _src_utils_path;
var ViewMap_1 = _src_class_ViewMap;
var exports_1 = _src_compo_Controls_exports;
var View_1 = _src_compo_View;
var ViewChanger_1 = _src_class_ViewChanger;
var ActivityTracker_1 = _src_class_ActivityTracker;
var ViewManagerCompo = /** @class */ (function (_super) {
    __extends(ViewManagerCompo, _super);
    function ViewManagerCompo() {
        var _this = _super.call(this) || this;
        _this.tagName = 'div';
        _this.attr = {
            style: 'position: relative',
            class: 'v-manager',
            path: null,
        };
        _this.xBase = '';
        _this.xViewmap = null;
        _this.xRouting = true;
        _this.xNested = true;
        _this.meta = {
            // attributes: {
            //     base: '',
            //     viewmap: '',
            //     routing: true,
            //     nested: true
            // },
            serializeScope: true
        };
        _this.scope = {
            notificationMsg: '',
            notificationType: '',
            viewmap: null
        };
        _this.routes = null;
        _this.route = null;
        _this.next = null;
        _this.viewmap = null;
        _this.routes = new ruta.Collection;
        return _this;
    }
    ViewManagerCompo.prototype.serializeScope = function () {
        return JSON.stringify(this.scope);
    };
    ViewManagerCompo.prototype.viewNavigate = function (sender, path, model, route) {
        var _a;
        if (sender === this) {
            return;
        }
        var current = this.route;
        var compo = (_a = current === null || current === void 0 ? void 0 : current.value) === null || _a === void 0 ? void 0 : _a.compo;
        this.navigate(path, model, {
            defaultView: false,
            fromParent: true,
            params: (route === null || route === void 0 ? void 0 : route.current.params) || null
        });
        return false;
    };
    ViewManagerCompo.prototype.viewActivation = function (sender) {
        if (sender === this)
            return;
        var compo = this.route && this.route.value && this.route.value.compo;
        if (compo) {
            //compo.emitIn('viewActivation', this);
        }
        return false;
    };
    ViewManagerCompo.prototype.viewDeactivation = function (sender) {
        if (sender === this)
            return;
        var compo = this.route && this.route.value && this.route.value.compo;
        if (compo) {
            compo.emitIn('viewDeactivation', this);
        }
        return false;
    };
    ViewManagerCompo.prototype.back = function (sender) {
        var track = this.activityTracker.back();
        this.navigate(track.current.path);
    };
    ViewManagerCompo.prototype.activity = function (type) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.emitIn.apply(this, __spreadArrays(['views:activity', type], args));
    };
    ViewManagerCompo.prototype.onRenderStart = function (model, ctx) {
        var _this = this;
        var _a;
        ViewMap_1.ViewMap.ensure(this, model, ctx);
        ViewMap_1.ViewMap.createRoutes(this);
        var path = path_1.path_getCurrent(ctx);
        var _b = ViewMap_1.ViewMap.getRouteByPathOrDefault(this, path), route = _b.route, isDefault = _b.isDefault;
        var params = (_a = route === null || route === void 0 ? void 0 : route.current) === null || _a === void 0 ? void 0 : _a.params;
        if (params) {
            if (ctx.params == null) {
                ctx.params = {};
            }
            mask.obj.extend(ctx.params, params);
        }
        // Save for later use in onRenderEnd (as this fn can be on server-side)
        this.attr.path = path;
        this.route = route;
        this.initialAsDefault = isDefault;
        this.nodes = mask.j()
            .add(this.getCompo_('Notification'))
            .add(this.getCompo_('Progress'))
            .add(this.getCompo_('Animation'), false);
        if (route == null) {
            return;
        }
        var viewData = route.value;
        if (viewData.path == null) {
            this.nodes.add(viewData.getNodes() || mask.j());
            return;
        }
        var resume = mask.Compo.pause(this, ctx);
        this
            .loadView(route, model)
            .done(function (route) {
            _this.nodes.add(viewData.getNodes() || mask.j());
            resume();
        })
            .fail(function () { return resume(); });
    };
    ViewManagerCompo.prototype.onRenderStartClient = function (model, ctx) {
        ViewMap_1.ViewMap.ensure(this, model, ctx);
        ViewMap_1.ViewMap.createRoutes(this);
    };
    ViewManagerCompo.prototype.onRenderEndServer = function () {
        this.scope.viewmap = this.viewmap.toJSON();
    };
    ViewManagerCompo.prototype.onRenderEnd = function (elements, model, ctx) {
        var _this = this;
        this.activityTracker = new ActivityTracker_1.ActivityTracker(this);
        this.viewChanger = new ViewChanger_1.ViewChanger(this);
        this.ctx = ctx;
        if (this.xRouting) {
            ViewMap_1.ViewMap.bindRouter(this, model, ctx);
        }
        if (this.route == null && this.attr.path != null) {
            var _a = ViewMap_1.ViewMap.getRouteByPathOrDefault(this, this.attr.path), route = _a.route, isDefault = _a.isDefault;
            this.route = route;
            this.initialAsDefault = isDefault;
        }
        if (this.route == null) {
            return;
        }
        var viewData = this.route.value;
        if (this.initialAsDefault && Boolean(viewData.navigateDefault) && ruta.getBackStack().length === 0) {
            ruta.navigate(this.route.current.path, {
                replace: true,
                silent: true,
            });
        }
        var compo = this.find('View');
        if (compo != null) {
            compo.emitIn('viewActivation', this);
        }
        viewData.compo = compo;
        this.activityTracker.show(this.route, function () { return mask.Compo.await(_this); });
    };
    ViewManagerCompo.prototype.getCtx = function (route) {
        var ctx = mask.obj.extend(null, this.ctx);
        ctx.params = route.current.params;
        return ctx;
    };
    ViewManagerCompo.prototype.isNested = function () {
        var owner = mask.Compo.closest(this.parent, 'ViewManager');
        return owner != null;
    };
    ViewManagerCompo.prototype.navigate = function (path, model, opts) {
        var _this = this;
        var route = ViewMap_1.ViewMap.getRouteByPathOrCurrentOrDefault(this, path, opts === null || opts === void 0 ? void 0 : opts.params);
        var dfr = new mask.class.Deferred;
        if (route == null) {
            return dfr.reject("View not found: " + path);
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
        return this
            .activityTracker
            .show(route, function () { return _this.loadView(route, model).then(function () { return _this.renderView(route, model); }); })
            .done(function () {
            if (initial === false) {
                route.value.compo.emitIn('viewNavigate', path);
            }
            _this.performShow(route, initial);
        });
    };
    ViewManagerCompo.prototype.hideCompo_ = function (compo) {
        if (compo == null)
            return;
        compo.emitIn('viewDeactivation', this);
        return compo.hide_();
    };
    ViewManagerCompo.prototype.showCompo_ = function (compo, isInitial) {
        var _this = this;
        return compo
            .show_()
            .then(function () { return compo.emitIn('viewActivation', _this); });
    };
    ViewManagerCompo.prototype.emit = function (type) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (_a = mask.Compo.pipe('views')).emit.apply(_a, __spreadArrays([type, this], args));
    };
    ViewManagerCompo.prototype.loadView = function (route, model) {
        return mask.class.Deferred.run(function (resolve, reject) {
            var viewData = route.value;
            if (viewData.viewNode != null) {
                resolve(route);
                return;
            }
            var path = viewData.path;
            mask
                .Module
                .createModule(new mask.Module.Endpoint(path, 'mask'), null, null)
                .loadModule()
                .fail(reject)
                .done(function (module) {
                var nodes = module.exports.__nodes__;
                viewData.createViewNode(nodes);
                resolve(route);
            });
        });
    };
    ViewManagerCompo.prototype.renderView = function (route, model) {
        var _this = this;
        return mask.class.Deferred.run(function (resolve, reject, dfr) {
            if (route.value.compo) {
                resolve(route);
                return;
            }
            var ctx = _this.getCtx(route);
            mask.renderAsync(route.value.getNodes(), model || _this.model, ctx, null, _this)
                .done(function (frag, compo) {
                var last = compo.components[compo.components.length - 1];
                var view = mask.Compo.prototype.find.call(last, 'View');
                route.value.compo = view;
                resolve(route);
            });
        });
    };
    ViewManagerCompo.prototype.performShow = function (route, isInitial) {
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
    };
    ViewManagerCompo.prototype.notify = function (type, message) {
        if (arguments.length === 0) {
            type = message = '';
        }
        this.scope.notificationType = type;
        this.scope.notificationMsg = message;
        this.emitIn('formNotification', { type: type, message: message });
    };
    ViewManagerCompo.prototype.getCompo_ = function (name, shouldCreate) {
        if (shouldCreate === void 0) { shouldCreate = true; }
        var set = mask.j(this).children(name);
        if (shouldCreate === false) {
            return set;
        }
        return set.length === 0 ? mask.j(name) : set;
    };
    ViewManagerCompo.prototype.throw_ = function (error) {
        this.nodes = mask.parse("\n            div style='background: red; color: white; padding: 15px; font-weight: bold' {\n                \"" + error.message + "\"\n            }\n        ");
    };
    ViewManagerCompo.prototype.errored_ = function (error) {
        this.activity('end');
        this.activity('error', error);
        this.notify('danger', error.message || String(error));
    };
    __decorate([
        mask.deco.attr({ default: '', type: 'string', name: 'base' })
    ], ViewManagerCompo.prototype, "xBase", void 0);
    __decorate([
        mask.deco.attr({ default: '', type: 'string', name: 'viewmap' })
    ], ViewManagerCompo.prototype, "xViewmap", void 0);
    __decorate([
        mask.deco.attr({ default: true, type: 'boolean', name: 'routing' })
    ], ViewManagerCompo.prototype, "xRouting", void 0);
    __decorate([
        mask.deco.attr({ default: true, type: 'boolean', name: 'nested' })
    ], ViewManagerCompo.prototype, "xNested", void 0);
    __decorate([
        mask.deco.slot()
    ], ViewManagerCompo.prototype, "viewNavigate", null);
    __decorate([
        mask.deco.slot()
    ], ViewManagerCompo.prototype, "viewActivation", null);
    __decorate([
        mask.deco.slot()
    ], ViewManagerCompo.prototype, "viewDeactivation", null);
    __decorate([
        mask.deco.slot()
    ], ViewManagerCompo.prototype, "back", null);
    return ViewManagerCompo;
}(mask.Component));
exports.ViewManagerCompo = ViewManagerCompo;
;
mask.registerHandler('ViewManager', ViewManagerCompo);
mask.define(ViewManagerCompo, 'View', View_1.ViewCompo);
mask.define(ViewManagerCompo, exports_1.ControlsTemplates);
;

    function isObject(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (isObject(_src_compo_ViewManager) && isObject(module.exports)) {
        Object.assign(_src_compo_ViewManager, module.exports);
    } else {
        _src_compo_ViewManager = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ViewManager_1 = _src_compo_ViewManager;
Object.defineProperty(exports, "ViewManagerCompo", { enumerable: true, get: function () { return ViewManager_1.ViewManagerCompo; } });


}));
