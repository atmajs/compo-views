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

			this.history.push(route)
			this.requestProgressStart();
			return dfr.done(() => this.requestProgressEnd(route));
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
			return this.history[this.history.length - 1];
		},
		history: null,
		active: false,
		route: null,
		tick: null,
		vm: null,
	});
}());