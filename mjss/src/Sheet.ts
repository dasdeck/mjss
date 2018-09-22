import RuleList from './RuleList';
import RuleListRenderer from './RuleListRenderer';
import { forEach } from 'lodash';
import ContainerRule from './ContainerRule';
import Rule from './Rule';

export default class Sheet {

    options: any
    data: any
    rules: RuleList
    hooks: any

    constructor(options: any = {plugins: []}, data = {}) {
        this.options = options;
        this.data = data;

        this.hooks = [
            'onInit',
            'onReady',
            'createRule',
            'onBeforeRender',
            'onOutput',
            'onProcess',
            'onBeforeOutput'
        ].reduce((res, hookName) => {

            const hooks = this.options.plugins.filter(plugin => plugin[hookName]).map(plugin => plugin[hookName].bind(plugin));
            if (hooks.length) {
                res[hookName] = hooks;
            }
            return res;
        }, {});


        this.hook('onInit', this);

        this.rules = new RuleList(this);

        this.iterateAst(this.rules, rule => {
            this.hook('onReady', rule);
        });

    }

    iterateAst(list:RuleList, action:Function) {
        forEach(list.rules, (rule:Rule) => {
            action(rule);
            if (rule instanceof ContainerRule) {
                this.iterateAst(rule.rules, action);
            }
        })
    }


    hook(name, ...args) {

        const hooks = this.hooks[name];
        if (hooks) {
            for (let i = 0; i < hooks.length; i++) {
                const res = hooks[i](...args);
                if (res) {
                    return res;
                }
            }
        }
    }

    toString() {

        const renderer = new RuleListRenderer(this.rules);
        this.hook('onBeforeRender', renderer);
        this.rules.render(renderer);
        this.hook('onBeforeOutput', renderer);
        return renderer.toString();

    }

}

