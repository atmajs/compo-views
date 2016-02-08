var ViewCompo;
(function(){

	var view_NONE = 1,
		view_DETACHED = 2,
		view_ATTACHED = 3,
		view_VISIBLE = 4,
		view_HIDDEN = 5;

	ViewCompo = Compo({
		meta: {
			attributes: {
				'default': false,
				'detach': true
			}
		},
		slots: {
			viewDeactivation () {
				if (this.state === view_HIDDEN) {
					return false;
				}
				this.state = view_HIDDEN;
			}
		},
		tagName: 'div',
		attr: {
			class: 'v-view',
			style: 'position:relative'
		},
		onRenderStart () {

		},
		state: view_NONE,
		hide_ () {
			this.hide().then(() => {
				if (this.xDetach === true) {
					this.state = view_DETACHED;
					this.$.remove();
				}
			});
		},
		show_ () {
			if (this.state <= view_ATTACHED) {
				this.parent.$.append(this.$);
			}
			this.show();
		},
		hide () {
			this.$.hide();
			return (new mask.class.Deferred()).resolve();
		},
		show () {
			this.$.show();
			return (new mask.class.Deferred()).resolve();
		}
	});


	mask.define(ViewManagerCompo, 'View', ViewCompo);

}());
