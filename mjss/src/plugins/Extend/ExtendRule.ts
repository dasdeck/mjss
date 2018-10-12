import Rule from "../../Rule";
import ContainerRuleRenderer from "../../ContainerRuleRenderer";
import { patternExtend } from "./lib";
import Extend from ".";

let id = 1;

class Transformation {

    rule: ExtendRule
    renderer: ContainerRuleRenderer

    constructor(rule, renderer) {
        this.rule = rule;
        this.renderer = renderer;
    }

    apply() {
        const targetSelector = this.rule.getTargetSelector();
        if (targetSelector) {

            const targetSelectors = targetSelector.split(', ');
            const selectors = this.renderer.key.split(', ');
            if (this.rule.value.all) {
                selectors.forEach(selector => {
                    if (selector.match(this.rule.search)) {
                        targetSelectors.forEach(targetSelector => {
                            selectors.push(selector.replace(new RegExp(this.rule.className, 'g'), targetSelector));
                        });
                    }
                });
            } else {
                targetSelectors.forEach(targetSelector => {
                    selectors.push(targetSelector);
                });
            }

            this.renderer.key = selectors.join(', ');
        }
    }
}
export default class ExtendRule extends Rule {

    className: string
    search: RegExp
    replace: RegExp
    currentParrent: ContainerRuleRenderer
    transformations: Array<any> = []
    extend: Extend
    id: number

    constructor(sheet, data, key, parent, extend) {
        super(sheet, data, key, parent);

        this.extend = extend;

        this.id = id++;

        const className = this.key.substr(patternExtend.length);
        const prefix = className[0] === '.' ? '.' : '';
        const search = className.substr(prefix.length);
        this.className = className;
        if (this.value.all) {
            this.search = new RegExp(/prefix(?:\b)search(?:\b[^-]|$)/g.source.replace('prefix', prefix).replace('search', search));
        } else {
            this.search = new RegExp(/(?:,|^)\s*prefix(?:\b)search(?:\b\s*(?:,|$))/g.source.replace('prefix', prefix).replace('search', search));
        }

        this.replace  = new RegExp(this.search.source, 'g');

    }

    mark(rule) {
        const match = rule.key && rule.key.match && rule.key.match(this.search);
        if (match) {

            rule._extend = rule._extend || {};
            rule._extend[this.id] = this;
        }
    }

    render(r:ContainerRuleRenderer) {
        this.currentParrent = r;
    }


    getTargetSelector() {

        return this.currentParrent && this.currentParrent.key;
    }

    apply() {
        this.transformations.forEach(t => t.apply());
        this.transformations = [];
    }

    addTransform(renderer) {

        if (!renderer.id) {
            renderer.id = id++;
        }

        this.extend.renderers[renderer.id] = renderer;

        const trans = new Transformation(this, renderer);
        renderer.transformations = renderer.transformations || [];
        renderer.transformations.push(trans);

        this.transformations.push(trans);

    }

    collect(renderer) {

        const match = this.extend.options.assumeStaticSelectors ?
        renderer.rule._extend && renderer.rule._extend[this.id] :
        renderer.key && renderer.key.match(this.search);

        if (match) {
            this.addTransform(renderer);
        }

    }

}
