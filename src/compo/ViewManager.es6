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
		}
	},

	slots: {
		viewNavigate (sender, path, model) {
			if (sender === this) return;
			var current = this.route;
			var compo = current && current.value && current.value.compo;
			this
				.navigate(path, model, { defaultView: false })
				.done(() => {
					if (current === this.route) {
						compo.emitIn('viewActivation', this.route.current.params);
					}
				});
			return false;
		},
		viewActivation (sender) {
			if (sender === this) return;
			var compo = this.route && this.route.value && this.route.value.compo;
			if (compo) {
				//compo.emitIn('viewActivation', this.route.current.params);
			}
			return false;
		},
		viewDeactivation (sender) {
			var compo = this.route && this.route.value && this.route.value.compo;
			if (compo) {
				compo.emitIn('viewDeactivation');
			}
			return false;
		},
		back (sender) {
			var track = this.activityTracker.back();
			this.navigate(track.current.path);
		}
	},

	scope: {
		notificationMsg: '',
		notificationType: ''
	},

	viewmap: null,
	routes: null,
	route: null,
	next: null,

	activity (type, ...args) {
		this.emitIn('views:activity', type, ...args);
	},

	constructor () {
		this.routes = new ruta.Collection;
	},

	onRenderStart (model, ctx) {
		ViewMap.ensure(this, model, ctx);
		ViewMap.createRoutes(this);

		var path = path_getCurrent(ctx);
		var route = ViewMap.getRouteByPath(this, path);

		this.route = route;
		this.nodes = route && route.value.getNodes();
		this.ensureCompo_('Notification');
		this.ensureCompo_('Progress');
		this.attr.path = path;

		ctx.params = route && route.current && route.current.params;
	},
	onRenderEnd (elements, model, ctx) {
		this.activityTracker = new ActivityTracker(this);
		this.ctx = ctx;

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
		var compo = this.find('View');
		if (compo != null) {
			compo.emitIn('viewActivation');
		}
		viewData.compo = compo;
		this.activityTracker.show(this.route, () => Compo.await(this));
	},
	getCtx (route) {
		var ctx = mask.obj.extend(null, this.ctx);
		ctx.params = route.current.params;
		return ctx;
	},
	isNested () {
		var owner = Compo.closest(this.parent, 'ViewManager');
		return owner != null;
	},
	navigate (path, model, opts) {
		var route = ViewMap.getRouteByPath(this, path);
		if (route == null) {
			var dfr = new mask.class.Deferred();
			if (opts && opts.defaultView === false) {
				return dfr.resolve(this.route);
			}
			return dfr.reject(`View not found: ${path}`);
		}
		var initial = route.value.compo == null;
		return this
			.activityTracker
			.show(route, () => this.renderView(route, model))
			.done(() => {
				if (initial === false) {
					route.value.compo.emitIn('viewNavigate', path);
				}
				this.performShow(route);
			});
	},

	hideCompo_ (compo) {
		if (compo == null) return;
		compo.emitIn('viewDeactivation', this);
		return compo.hide_();
	},

	showCompo_ (compo) {
		if (compo == null) return;
		compo.emitIn('viewActivation', this);
		return compo.show_();
	},

	emit (type, ...args) {
		Compo.pipe('views').emit(type, this, ...args);
	},

	activate (route) {
		compo.emitIn('viewActivation', route.current.params);
	},

	renderView (route, model) {
		return mask.class.Deferred.run((resolve, reject, dfr) => {
			if (route.value.compo) {
				resolve(route);
				return;
			}
			var ctx = this.getCtx(route);
			mask
				.renderAsync(route.value.getNodes(), model, ctx, null, this)
				.done((frag, compo) => {
					var last = compo.components[compo.components.length - 1];
					var view = Compo.prototype.find.call(last, 'View');
					route.value.compo = view;
					resolve(route);
				});
		});
	},
	performShow (route) {
		var current = this.route;
		if (current === route) {
			return;
		}
		this.route = route;

		var currentView = current.value.compo;
		if (currentView) {
			this.hideCompo_(currentView);
			if (currentView.xRecycle === true) {
				this.activityTracker.clear(current);
			}
		}
		this.showCompo_(route.value.compo);
	},

	notify (type, message) {
		if (arguments.length === 0) {
			type = message = '';
		}
		this.scope.notificationType = type;
		this.scope.notificationMsg  = message;
		this.emitIn('formNotification', { type, message });
	},

	ensureCompo_ (name) {
		var set = jmask(this).children(name);
		if (set.length !== 0) {
			return;
		}
		jmask(this).prepend(name);
	},


	throw_ (error) {
		this.nodes = mask.parse(`
			div style='background: red; color: white; padding: 15px; font-weight: bold' {
				"${error.message}"
			}
		`);
	},

	errored_ (error) {
		this.activity('end');
		this.activity('error', error);
		this.notify('danger', error.message || String(error));
	}
});

// import Controls/exports.es6
// import View.es6