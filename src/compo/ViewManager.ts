import { path_getCurrent } from '../utils/path';
import { ViewMap } from '../class/ViewMap';
import { ControlsTemplates } from './Controls/exports';
import { ViewCompo } from './View';
import { ViewChanger } from '../class/ViewChanger';
import { ActivityTracker } from '../class/ActivityTracker';
import { ViewData } from '../class/ViewData';

export class ViewManagerCompo extends mask.Component {
    tagName = 'div'
    attr = {
        style: 'position: relative',
        class: 'v-manager',
        path: null,
    };

    @mask.deco.attr({ default: '', type: 'string', name: 'base' })
    xBase = ''

    @mask.deco.attr({ default: '', type: 'string', name: 'viewmap' })
    xViewmap: ViewMap = null


    @mask.deco.attr({ default: true, type: 'boolean', name: 'routing' })
    xRouting: boolean = true

    @mask.deco.attr({ default: true, type: 'boolean', name: 'nested' })
    xNested: boolean = true

    meta = <any> {
        // attributes: {
        //     base: '',
        //     viewmap: '',
        //     routing: true,
        //     nested: true
        // },
        serializeScope: true
    }

    serializeScope() {
        return JSON.stringify(this.scope);
    }

    @mask.deco.slot()
    viewNavigate(sender, path: string, model, route: InstanceType<typeof ruta.Route>) {
        if (sender === this) {
            return;
        }
        let current = this.route;
        let compo = current?.value?.compo;
        this.navigate(path, model, {
            defaultView: false,
            fromParent: true,
            params: route?.current.params || null
        });
        return false;
    }
    @mask.deco.slot()
    viewActivation(sender) {
        if (sender === this) return;
        let compo = this.route && this.route.value && this.route.value.compo;
        if (compo) {
            //compo.emitIn('viewActivation', this);
        }
        return false;
    }
    @mask.deco.slot()
    viewDeactivation(sender) {
        if (sender === this) return;
        let compo = this.route && this.route.value && this.route.value.compo;
        if (compo) {
            compo.emitIn('viewDeactivation', this);
        }
        return false;
    }
    @mask.deco.slot()
    back(sender) {
        let track = this.activityTracker.back();
        this.navigate(track.current.path);
    }

    scope = {
        notificationMsg: '',
        notificationType: '',
        viewmap: null
    }

    nodes: any

    routes: InstanceType<typeof ruta.Collection>  = null
    route:  Omit<InstanceType<typeof ruta.Route>, 'value'> & { value: ViewData } = null
    next = null

    viewmap: ViewMap = null
    activityTracker: ActivityTracker
    viewChanger: ViewChanger
    ctx: any

    initialAsDefault: boolean

    activity(type, ...args) {
        this.emitIn('views:activity', type, ...args);
    }

    constructor() {
        super()
        this.routes = new ruta.Collection;
    }

    onRenderStart(model, ctx) {
        ViewMap.ensure(this, model, ctx);
        ViewMap.createRoutes(this);

        let path = path_getCurrent(ctx);
        let { route, isDefault } = ViewMap.getRouteByPathOrDefault(this, path);
        let params = route?.current?.params;
        if (params) {
            if (ctx.params == null) {
                ctx.params = {};
            }
            mask.obj.extend(ctx.params, params);
        }

        // Save for later use in onRenderEnd (as this fn can be on server-side)
        this.attr.path = path;
        this.route = route;
        this.initialAsDefault = isDefault;
        this.nodes = (mask.j as any)()
            .add(this.getCompo_('Notification'))
            .add(this.getCompo_('Progress'))
            .add(this.getCompo_('Animation'), false);

        if (route == null) {
            return;
        }
        let viewData = route.value;
        if (viewData.path == null) {
            this.nodes.add(viewData.getNodes() || (mask.j as any)());
            return;
        }
        let resume = mask.Compo.pause(this, ctx);
        this
            .loadView(route, model)
            .done((route) => {
                this.nodes.add(viewData.getNodes() || (mask.j as any)());
                resume();
            })
            .fail(() => resume());
    }
    onRenderStartClient(model, ctx) {
        ViewMap.ensure(this, model, ctx);
        ViewMap.createRoutes(this);
    }
    onRenderEndServer() {
        this.scope.viewmap = this.viewmap.toJSON();
    }
    onRenderEnd(elements, model, ctx) {
        this.activityTracker = new ActivityTracker(this);
        this.viewChanger = new ViewChanger(this);
        this.ctx = ctx;

        if (this.xRouting) {
            ViewMap.bindRouter(this, model, ctx);
        }
        if (this.route == null && this.attr.path != null) {
            let { route, isDefault } = ViewMap.getRouteByPathOrDefault(this, this.attr.path);
            this.route = route;
            this.initialAsDefault = isDefault;
        }
        if (this.route == null) {
            return;
        }
        let viewData = this.route.value;
        if (this.initialAsDefault && Boolean(viewData.navigateDefault) && ruta.getBackStack().length === 0) {
            ruta.navigate(this.route.current.path, {
                replace: true,
                silent: true,
            });
        }
        let compo = this.find('View');
        if (compo != null) {
            compo.emitIn('viewActivation', this);
        }
        viewData.compo = compo;
        this.activityTracker.show(this.route, () => mask.Compo.await(this));
    }
    getCtx(route) {
        let ctx = mask.obj.extend(null, this.ctx);
        ctx.params = route.current.params;
        return ctx;
    }
    isNested() {
        let owner = mask.Compo.closest(this.parent, 'ViewManager');
        return owner != null;
    }
    navigate(path: string, model?, opts?: {
        params?
        fromParent?: boolean
        defaultView?: boolean
    }) {
        let route = ViewMap.getRouteByPathOrCurrentOrDefault(this, path, opts?.params);
        let dfr = new mask.class.Deferred;
        if (route == null) {
            return dfr.reject(`View not found: ${path}`);
        }
        let initial = route.value.compo == null;
        if (route === this.route) {
            if (initial === false) {
                route.value.compo.emitIn('viewNavigate', path, model, route);
            }
            if (opts && opts.fromParent === true && route.value.compo) {
                route.value.compo.emitIn('viewActivation', this);
            }
            return dfr.resolve(route);
        }
        return this
            .activityTracker
            .show(route, () => this.loadView(route, model).then(() => this.renderView(route, model)))
            .done(() => {
                if (initial === false) {
                    route.value.compo.emitIn('viewNavigate', path);
                }
                this.performShow(route, initial);
            });
    }

    hideCompo_(compo: ViewCompo) {
        if (compo == null) return;
        compo.emitIn('viewDeactivation', this);
        return compo.hide_();
    }

    showCompo_(compo: ViewCompo, isInitial) {
        return compo
            .show_()
            .then(() => compo.emitIn('viewActivation', this));
    }

    emit(type, ...args) {
        mask.Compo.pipe('views').emit(type, this, ...args);
    }

    loadView(route, model) {
        return mask.class.Deferred.run((resolve, reject) => {
            let viewData = route.value;
            if (viewData.viewNode != null) {
                resolve(route);
                return;
            }
            let path = viewData.path;
            mask
                .Module
                .createModule(new mask.Module.Endpoint(path, 'mask'), null, null)
                .loadModule()
                .fail(reject)
                .done(module => {
                    let nodes = module.exports.__nodes__;
                    viewData.createViewNode(nodes);
                    resolve(route);
                });
        });
    }
    renderView(route, model) {
        return mask.class.Deferred.run((resolve, reject, dfr) => {
            if (route.value.compo) {
                resolve(route);
                return;
            }
            let ctx = this.getCtx(route);
            (<any> mask.renderAsync(route.value.getNodes(), model || this.model, ctx, null, this))
                .done((frag, compo) => {
                    let last = compo.components[compo.components.length - 1];
                    let view = mask.Compo.prototype.find.call(last, 'View');
                    route.value.compo = view;
                    resolve(route);
                });
        });
    }
    performShow(route, isInitial) {
        let current = this.route;
        if (current === route) {
            return;
        }
        this.route = route;
        this.viewChanger.show(route, current, isInitial);

        if (current != null && current.value.compo != null) {
            if (current.value.compo.xRecycle === true) {
                this.activityTracker.clear(current);
            }
        }
    }

    notify(type, message) {
        if (arguments.length === 0) {
            type = message = '';
        }
        this.scope.notificationType = type;
        this.scope.notificationMsg = message;
        this.emitIn('formNotification', { type, message });
    }

    getCompo_(name, shouldCreate = true) {
        let set = mask.j(this).children(name);
        if (shouldCreate === false) {
            return set;
        }
        return set.length === 0 ? mask.j(name) : set;
    }


    throw_(error) {
        this.nodes = mask.parse(`
            div style='background: red; color: white; padding: 15px; font-weight: bold' {
                "${error.message}"
            }
        `);
    }

    errored_(error) {
        this.activity('end');
        this.activity('error', error);
        this.notify('danger', error.message || String(error));
    }
};

mask.registerHandler('ViewManager', ViewManagerCompo);
mask.define(ViewManagerCompo, 'View', ViewCompo);
mask.define(ViewManagerCompo, ControlsTemplates);

