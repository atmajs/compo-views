var ActivityTracker;
(function(){
	ActivityTracker = mask.class.create({
		tickStart: null,
		tickEnd: null,
		constructor (viewManager) {
			this.history = [];
			this.routes = [];
			this.vm = viewManager;
		},
		show (route, loaderFn) {
			var i = this.routes.indexOf(route),
				dfr;
			if (i === -1) {
				route.dfr = dfr = loaderFn();
				this.routes.push(route);
			} else {
				dfr = this.routes[i].dfr;
			}

			this.history.push({ current: route.current, route: route });
			this.requestProgressStart();
			return dfr.done(() => this.requestProgressEnd(route)).fail(() => { debugger });
		},
		clear (route) {
			var i = this.routes.indexOf(route);
			if (i === -1) return;

			route.dfr = null;
			route.value.compo = null;
			this.routes.splice(i, 1);
		},
		requestProgressStart (route) {
			this.cancelProgressEnd();
			this.tickStart = setTimeout(this.progressStart.bind(this, route));
		},
		requestProgressEnd (route) {
			this.cancelProgressStart();
			this.tickEnd = setTimeout(this.progressEnd.bind(this, route));
		},
		cancelProgressStart () {
			clearTimeout(this.tickStart);
		},
		cancelProgressEnd () {
			clearTimeout(this.tickEnd);
		},
		progressStart () {
			this.cancelProgressEnd();
			this.vm.emitIn('viewActivity', 'start');
		},
		progressEnd (route) {
			if (route != null && this.current !== route) {
				return;
			}
			this.cancelProgressStart();
			this.cancelProgressEnd();
			this.vm.emitIn('viewActivity', 'end');
		},
		get current () {
			var track = this.history[this.history.length - 1];
			return track && track.route;
		},
		back () {
			this.history.pop();
			return this.history.pop();
		},
		history: null,
		active: false,
		route: null,
		tick: null,
		vm: null,
	});
}());