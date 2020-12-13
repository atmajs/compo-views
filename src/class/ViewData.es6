var ViewData,
	ViewState;

(function(){

	ViewState = {
		NONE: 0,
		LOADING: 1,
		LOADED: 2,
		RENDERING: 3,
		RENDERED: 4
	};

	ViewData = mask.class.create({
		viewNode: null,
		nodes: null,
		compo: null,
		route: null,
		state: ViewState.NONE,
		path: null,
		/*
		 * View is shown when no route is matched, otherwise viewManager decides
		 * whether to hide everything, or to show an error
		 */
		default: null,
		constructor (...args) {
			var imax = args.length,
				i = -1;
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
		},
		getNodes () {
			if (this.viewNode != null) {
				if (this.path != null && this.viewNode.nodes == null) {
					this.viewNode.nodes = mask.parse(`import from '${this.path}'`);
				}
				return this.viewNode;
			}
			if (this.nodes == null && this.path != null) {
				return (this.nodes = mask.parse(`import from '${this.path}'`));
			}
			return this.nodes;
		},
		toJSON () {
			return {
				route: this.route,
				state: this.state,
				path: this.path,
				viewNode: this.viewNode ? mask.stringify(this.viewNode) : null,
				nodes: this.nodes ? mask.stringify(this.nodes) : null,
			};
		},
		createViewNode (nodes) {
			var $ = j(nodes);

			if (this.hasView_($) === false) {
				var container = this.viewNode || j('View');
				this.viewNode = j(container).append(nodes);
				return;
			}
			this.viewNode = $[0];
		},
		hasView_ ($nodes) {
			if ($nodes.length !== 1) {
				return false;
			}
			// Any Component supposed to be an IView
			var name = $nodes.tag();
			if (name[0] === name[0].toUpperCase()) {
				return true;
			}
			return false;
		}
	});

	ViewData.createFromNode = function (viewNode) {
		return new ViewData({
			viewNode: viewNode,
			route: viewNode.attr.route,
			path: viewNode.attr.path,
			'default': viewNode.attr['default'],
		});
	};
	ViewData.createFromObj = function  (data) {
		return new ViewData({
			route: data.route,
			path: data.path || data.view,
			'default': data['default'],
		});
	};
}());
