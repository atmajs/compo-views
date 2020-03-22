var ViewManagerCompo = mask.Compo({
    tagName: 'div',
    attr: {
        style: 'position: relative',
        class: 'v-manager',
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
            this.navigate(path, model, { defaultView: false, fromParent: true });
            return false;
        },
        viewActivation(sender) {
            if (sender === this) return;
            var compo = this.route && this.route.value && this.route.value.compo;
            if (compo) {
                //compo.emitIn('viewActivation', this);
            }
            return false;
        },
        viewDeactivation(sender) {
            if (sender === this) return;
            var compo = this.route && this.route.value && this.route.value.compo;
            if (compo) {
                compo.emitIn('viewDeactivation', this);
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
        this.routes = new ruta.Collection;
    },

    onRenderStart(model, ctx) {
        ViewMap.ensure(this, model, ctx);
        ViewMap.createRoutes(this);

        var path = path_getCurrent(ctx);
        var route = ViewMap.getRouteByPath(this, path);

        ctx.params = route && route.current && route.current.params;

        this.attr.path = path;
        this.route = route;
        this.nodes = j()
            .add(this.getCompo_('Notification'))
            .add(this.getCompo_('Progress'))
            .add(this.getCompo_('Animation'), false);

        if (route == null) {
            return;
        }
        var viewData = route.value;
        if (viewData.path == null) {
            this.nodes.add(viewData.getNodes() || j());
            return;
        }
        var resume = Compo.pause(this, ctx);
        this
            .loadView(route, model)
            .done((route) => {
                this.nodes.add(viewData.getNodes() || j());
                resume();
            })
            .fail(() => resume());
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
        var dfr = new mask.class.Deferred;
        if (route == null) {
            return dfr.reject(`View not found: ${path}`);
        }
        var initial = route.value.compo == null;
        if (route === this.route) {
            if (initial === false) {
                route.value.compo.emitIn('viewNavigate', path);
            }
            if (opts && opts.fromParent === true && route.value.compo) {
                route.value.compo.emitIn('viewActivation', this);
            }
            return dfr.resolve(route);
        }
        return this
            .activityTracker
            .show(route, () => this.loadView(route, model).then(() => this.renderView(route, model)))
            .done(() => {
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
        return compo
            .show_()
            .then(() => compo.emitIn('viewActivation', this));
    },

    emit(type, ...args) {
        Compo.pipe('views').emit(type, this, ...args);
    },

    loadView(route, model) {
        return mask.class.Deferred.run((resolve, reject) => {
            var viewData = route.value;
            if (viewData.viewNode != null) {
                resolve(route);
                return;
            }
            var path = viewData.path;
            mask
                .Module
                .createModule(new mask.Module.Endpoint(path, 'mask'))
                .loadModule()
                .fail(reject)
                .done(module => {
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
            mask
                .renderAsync(route.value.getNodes(), model || this.model, ctx, null, this)
                .done((frag, compo) => {
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

// import Controls/exports.es6
// import View.es6