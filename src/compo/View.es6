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
				'display': {
					description: 'Hides view when not visible',
					default: false,
					type: 'boolean'
				},
				'detach': true,
				'recycle': false,
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
			class: 'v-view'
		},
		onRenderStart () {

		},
		state: view_NONE,
		hide_ () {
			return this.hide().then(() => {
				if (this.xRecycle === true) {
					this.remove();
					return;
				}
				if (this.xDetach === true) {
					this.state = view_DETACHED;
					var fn = this.$.detach || this.$.remove;
					fn.call(this.$);
				}
			});
		},
		show_ () {
			if (this.state <= view_ATTACHED) {
				this.parent.$.append(this.$);
			}
			if (this.state === view_NONE ) {
				this.emitIn('domInsert');
				this.state = view_ATTACHED;
			}
			return this.show();
		},
		hide () {
			let isVisible = this.xDisplay 
				? view_VISIBLE 
				: view_HIDDEN;
			if (isVisible === false) {
				this.$.hide();
			}
			return (new mask.class.Deferred()).resolve();
		},
		show () {
			let isVisible = this.xDisplay 
				? view_VISIBLE 
				: view_HIDDEN;			
			if (isVisible === false) {
				this.$.show();
			}
			return (new mask.class.Deferred()).resolve();
		}
	});


	mask.define(ViewManagerCompo, 'View', ViewCompo);

}());
