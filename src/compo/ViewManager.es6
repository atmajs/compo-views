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
		this.ensureCompo_('Notification');
		this.ensureCompo_('Progress');

		ViewMap.ensure(this, model, ctx);
		ViewMap.createRoutes(this);

		var path = path_getCurrent(ctx);
		var route = ViewMap.getRouteByPath(this, path);

		this.route = route;
		this.nodes = route && route.value.getNodes();
	},
	onRenderEnd (elements, model, ctx) {
		if (this.xRouting) {
			ViewMap.bindRouter(this, model, ctx);
		}

		if (this.route != null) {
			var viewData = this.route.value;
			viewData.compo = this.find('View');
		}
	},
	navigate (path) {
		return mask.class.Deferred.run((resolve, reject) => {
			var route = ViewMap.getRouteByPath(this, path);
			if (route == null) {
				return reject(`View not found: ${path}`);
			}
			this.next = route;
			this
				.renderView(route)
				.fail(reject)
				.done(route => {
					this.performShow(route);
					resolve();
				});
		});
	},

	hideCompo_ (compo) {
		if (compo == null) {
			return null;
		}
		compo.emitIn('viewDeactivation');
		compo.hide_();
	},

	showCompo_ (compo) {
		compo.emitIn('viewActivation');
		compo.show_();
	},

	emit (type, ...args) {
		Compo.pipe('views').emit(type, this, ...args);
	},

	renderView (route) {
		return mask.class.Deferred.run((resolve, reject) => {
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
		if (route !== this.next) {
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