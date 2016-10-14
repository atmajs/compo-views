var ViewChanger;
(function(){
	ViewChanger = mask.class.create({
		vm: null,
		constructor (viewManager) {
			this.vm = viewManager;
		},
		show (route, prevRoute, isInitial) {
			var show = this.getShow(route, prevRoute);
			var hide = this.getHide(prevRoute, route);
			if (show.parallel) {
				this.hide_(hide, prevRoute);
				this.show_(show, route, isInitial);
				return;
			}
			this
				.hide_(hide, prevRoute)
				.then(() => this.show_(show, route, isInitial));
		},

		show_ (ani, route, isInitial) {
			return mask.class.Deferred.run(resolve => {
				this
					.vm
					.showCompo_(route.value.compo, isInitial)
					.then(() => {
						var el = route.value.compo.$[0];
						ani.start(resolve, el);
					});
			});
		},
		hide_ (ani, route) {
			return mask.class.Deferred.run(resolve => {
				if (route.value.compo == null) {
					resolve();
					return;
				}
				ani.start(() => {
					this.vm.hideCompo_(route.value.compo).then(resolve);
				}, route.value.compo.$[0]);
			});
		},

		getShow (route, beforeRoute) {
			return this.getAniForRoute(route, 'show', beforeRoute);
		},
		getHide (route, nextRoute) {
			return this.getAniForRoute(route, 'hide', nextRoute);
		},
		getAniForCompo (compo, id, pairedRouteDefinition) {
			return findAnimation(compo, id, pairedRouteDefinition);
		},
		getAniForRoute (route, id, anchorRoute) {
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
		start (cb) {
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
}());