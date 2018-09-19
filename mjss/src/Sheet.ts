import RuleList from './RuleList';
import RuleListRenderer from './RuleListRenderer';

export default class Sheet {

    options: any
    data: any
    rules: RuleList

    constructor(options: any, data = {}) {
        this.options = options;
        this.data = data;

        this.hook('onInit', this);

        this.rules = new RuleList(this);


    }


    hook(name, ...args) {

        for (let i = 0; i < this.options.plugins.length; i++) {
            const plugin = this.options.plugins[i];
            const res = plugin[name] && plugin[name](...args);
            if (res) {
                return res;
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

