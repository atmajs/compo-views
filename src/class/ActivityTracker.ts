import { ViewManagerCompo } from '../compo/ViewManager';

export class ActivityTracker {
    tickStart = null
    tickEnd = null
    vm = null

    history = []
    routes = []
    activityCounter = 0
    isBusy = false;

    constructor(viewManager: ViewManagerCompo) {
        this.vm = viewManager;
    }

    show(route, loaderFn) {
        var i = this.routes.indexOf(route),
            dfr;
        if (i === -1) {
            route.dfr = dfr = loaderFn();
            this.routes.push(route);
        } else {
            dfr = this.routes[i].dfr;
        }

        this.history.push({ current: route.current, route: route });
        this._requestProgressStart();
        return dfr
            .done(() => this._requestProgressEnd(route))
            .fail((error) => console.error(error));
    }
    clear(route) {
        var i = this.routes.indexOf(route);
        if (i === -1) return;

        route.dfr = null;
        route.value.compo = null;
        this.routes.splice(i, 1);
    }
    _requestProgressStart(route?) {
        this._activity(1, route);
    }
    _requestProgressEnd(route) {
        this._activity(-1, route);
    }
    _cancelProgressStart() {
        clearTimeout(this.tickStart);
    }
    _cancelProgressEnd() {
        clearTimeout(this.tickEnd);
    }
    _progressStart(route) {
        this._cancelProgressStart();
        this._cancelProgressEnd();
        this.isBusy = true;
        this.vm.emitIn('viewActivity', 'start');
    }
    _progressEnd(route) {
        // if (route != null && this.current !== route) {
        //     return;
        // }
        this._cancelProgressStart();
        this._cancelProgressEnd();
        this.isBusy = false;
        this.vm.emitIn('viewActivity', 'end');
    }
    _activity(val, route) {
        this._cancelProgressEnd();
        this._cancelProgressStart();

        if ((this.activityCounter += val) < 0) {
            this.activityCounter = 0;
        }
        var shouldBeBusy = this.activityCounter > 0;
        if (shouldBeBusy === this.isBusy) {
            return;
        }
        if (shouldBeBusy) {
            this.tickStart = setTimeout(this._progressStart.bind(this, route));
        } else {
            this.tickEnd = setTimeout(this._progressEnd.bind(this, route));
        }
    }
    get current() {
        var track = this.history[this.history.length - 1];
        return track && track.route;
    }
    back() {
        this.history.pop();
        return this.history.pop();
    }
};
