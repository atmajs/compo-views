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
			routing: true
		}
	},

	slots: {

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
	},
	onRenderEnd (elements, model, ctx) {
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
		viewData.compo = this.find('View');
		if (viewData.compo != null) {
			viewData.compo.emitIn('viewActivation');
		}
		this.activityTracker.show(this.route, () => Compo.await(this));
	},
	navigate (path) {
		var route = ViewMap.getRouteByPath(this, path);
		if (route == null) {
			return new mask.class.Deferred().reject(`View not found: ${path}`);
		}
		return this
			.activityTracker
			.show(route, () => this.renderView(route))
			.done(() => this.performShow(route));
	},

	hideCompo_ (compo) {
		if (compo == null) return;
		compo.emitIn('viewDeactivation', this);
		compo.hide_();
	},

	showCompo_ (compo) {
		if (compo == null) return;
		compo.emitIn('viewActivation', this);
		compo.show_();
	},

	emit (type, ...args) {
		Compo.pipe('views').emit(type, this, ...args);
	},

	activate (route) {
		compo.emitIn('viewActivation', route.current.params);
	},

	renderView (route) {
		return mask.class.Deferred.run((resolve, reject, dfr) => {
			if (route.value.compo) {
				resolve(route);
				return;
			}
			var params = route.current && route.current.params;
			mask
				.renderAsync(route.value.getNodes(), {params}, null, null, this)
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
		this.hideCompo_(current.value.compo);
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