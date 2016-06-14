var ViewChanger;
(function(){
	ViewChanger = mask.class.create({
		vm: null,
		constructor (viewManager) {
			this.vm = viewManager;
		},
		show (route, prevRoute, isInitial) {
			var show = this.getShow(route);
			var hide = this.getHide(prevRoute);
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

		getShow (route) {
			return this.getAniForRoute(route, 'show');
		},
		getHide (route) {
			return this.getAniForRoute(route, 'hide');
		},

		getAniForCompo (compo, id) {
			return findAnimation(compo, id);
		},
		getAniForRoute (route, id) {
			var ani = this.getAniForCompo(route.value.compo, id);
			if (ani == null) {
				ani = this.getAniForCompo(this.vm, id);
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

	function findAnimation(owner, id) {
		if (owner == null) {
			return null;
		}
		var compos = owner.components;
		if (compos == null) {
			return null;
		}
		var imax = compos.length,
			i = -1;
		while (++i < imax) {
			var compo = compos[i];
			var name = compo.compoName || compo.tagName;
			if (name === 'imports' || name === 'import') {
				var ani = findAnimation(compo, id);
				if (ani) {
					return ani;
				}
			}
			if (name === 'Animation' && compo.attr.id === id) {
				return compo;
			}
		}
		return null;
	}
}());