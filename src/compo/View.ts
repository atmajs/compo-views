
const view_NONE = 1;
const view_DETACHED = 2;
const view_ATTACHED = 3;
const view_VISIBLE = 4;
const view_HIDDEN = 5;

export class ViewCompo extends mask.Component {

    @mask.deco.attr({ default: '', type: 'string', name: 'default' })
    xDefault: string | boolean = ''

    // Hides view when not visible
    @mask.deco.attr({ default: false, type: 'boolean', name: 'display' })
    xDisplay: boolean = false

    @mask.deco.attr({ default: true, type: 'boolean', name: 'detach' })
    xDetach: boolean = true

    @mask.deco.attr({ default: false, type: 'boolean', name: 'recycle' })
    xRecycle: boolean = false

    // meta: {
    //     attributes: {
    //         'default': {
    //             default: '',
    //             type: 'string'
    //         },
    //         'display': {
    //             description: 'Hides view when not visible',
    //             default: false,
    //             type: 'boolean'
    //         },
    //         'detach': true,
    //         'recycle': false,
    //     }
    // },
    @mask.deco.slot()
    viewDeactivation() {
        if (this.state === view_HIDDEN) {
            return false;
        }
        this.state = view_HIDDEN;
    }

    tagName = 'div'
    attr = {
        class: 'v-view'
    }
    onRenderStart() {

    }
    state = view_NONE;
    hide_() {
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
    }
    show_() {
        if (this.state <= view_ATTACHED) {
            this.parent.$.append(this.$);
        }
        if (this.state === view_NONE) {
            this.emitIn('domInsert');
            this.state = view_ATTACHED;
        }
        return this.show();
    }
    hide() {
        // let isVisible = this.display
        //     ? view_VISIBLE
        //     : view_HIDDEN;
        // if (isVisible === view_HIDDEN) {
        //     this.$.hide();
        // }
        return (new mask.class.Deferred()).resolve();
    }
    show() {
        // let isVisible = this.display
        //     ? view_VISIBLE
        //     : view_HIDDEN;
        // if (isVisible === view_VISIBLE) {
        //     this.$.show();
        // }
        return (new mask.class.Deferred()).resolve();
    }
};


