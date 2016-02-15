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

		this.attr.path = path;
		this.route = route;
		this.nodes = j()
			.add(this.getCompo_('Notification'))
			.add(this.getCompo_('Progress'))
			.add(this.getCompo_('Animation'), false)
			.add(route && route.value.getNodes());

		ctx.params = route && route.current && route.current.params;
	},
	onRenderEnd (elements, model, ctx) {
		this.activityTracker = new ActivityTracker(this);
		this.viewChanger = new ViewChanger(this);

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
		this.viewChanger.show(route, current);

		if (current != null && current.value.compo != null) {
			if (current.value.compo.xRecycle === true) {
				this.activityTracker.clear(current);
			}
		}
	},

	notify (type, message) {
		if (arguments.length === 0) {
			type = message = '';
		}
		this.scope.notificationType = type;
		this.scope.notificationMsg  = message;
		this.emitIn('formNotification', { type, message });
	},

	getCompo_ (name, shouldCreate = true) {
		var set = j(this).children(name);
		if (shouldCreate === false) {
			return set;
		}
		return set.length === 0 ? j(name) : set;
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