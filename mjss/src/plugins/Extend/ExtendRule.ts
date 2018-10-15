import Rule from "../../Rule";
import ContainerRuleRenderer from "../../ContainerRuleRenderer";
import { patternExtend } from "./lib";
import Extend from ".";
import {escapeRegExp} from 'lodash';

let id = 1;

class Transformation {

    rule: ExtendRule
    renderer: ContainerRuleRenderer

    constructor(rule, renderer) {
        this.rule = rule;
        this.renderer = renderer;

    }

    apply() {
        const extender:any = this.rule.getExtender();

        if (extender) {

            if (extender._applyExtend) {
                extender._applyExtend();
            }

            const targetSelector = this.rule.getTargetSelector();
            if (targetSelector) {


                const targetSelectors = targetSelector.split(', ');
                const selectors = this.renderer.key.split(', ');
                if (this.rule.value.all) {
                    targetSelectors.forEach(targetSelector => {
                        selectors.forEach(selector => {
                            const replaced = selector.replace(this.rule.search, (a, b, c) => {
                                return `${b}${targetSelector}${c}`;
                            });
                            if (replaced !== selector) {
                                selectors.push(replaced);
                            }
                        });
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
        const search = escapeRegExp(className.substr(prefix.length));
        this.className = className;
        if (this.value.all) {
            this.search = new RegExp(/()(?:prefix(?:\b)search)+(\b[^-\\]|$)/.source.replace('prefix', prefix).replace('search', search), 'g');
        } else {
            this.search = new RegExp(/((?:,|^)\s*)(?:prefix(?:\b)search)(\b\s*(?:,|$)|$)/.source.replace('prefix', prefix).replace('search', search), 'g');
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

    getExtender() {
        return this.currentParrent;
    }

    getTargetSelector() {

        return this.currentParrent && this.currentParrent.key;
    }

    addTransform(renderer) {


        const trans = new Transformation(this, renderer);
        renderer.transformations = renderer.transformations || [];
        renderer.transformations.push(trans);

        if (!renderer._applyExtend) {
            renderer._applyExtend = function() {
                if (renderer.transformations) {
                    const transforms = renderer.transformations;
                    delete renderer.transformations;
                    transforms.forEach(t => t.apply())
                }
            }
        }

        this.extend.renderers.push(renderer);

    }

    collect(renderer) {

        if (renderer.key && renderer.key.match(this.search)) {
            this.addTransform(renderer);
        }


    }

}
