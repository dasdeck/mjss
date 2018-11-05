import Rule from "../../Rule";
import ContainerRuleRenderer from "../../ContainerRuleRenderer";
import { patternExtend } from "./lib";
import Extend from ".";
import {escapeRegExp, reduce, forEach} from 'lodash';

let id = 1;

class Transformation {

    rules: Array<ExtendRule> = []
    renderer: ContainerRuleRenderer
    cachedSelectors: Array<string>

    constructor(renderer) {
        this.renderer = renderer;

    }

    getOriginalSelectors():Array<string> {
        if (!this.cachedSelectors) {
            this.cachedSelectors = this.renderer.key.split(', ');
        }
        return this.cachedSelectors;
    }

    apply() {

        if (!this.rules.length) {
            return;
        }

        const extendMap = {all: {}, _: {}};
        while (this.rules.length) {

            const rule = this.rules.shift();

            const extender:any = rule.getExtender();

            if (extender) {

                if (extender._extend) {
                    extender._extend.apply();
                }
            }

            const set = rule.value.all ? extendMap.all : extendMap._;

            let entry = set[rule.className] || {selectors: [], replace: rule.replace};
            entry.selectors = [...entry.selectors, ...rule.getTargetSelectors()];
            set[rule.className] = entry;

        }

        let newSelectors = '';

        forEach(extendMap.all, (entry:any) => {
            const templates = this.getOriginalSelectors().map(selector => {
                const res = selector.replace(entry.replace, (_,b,c) => `${b}%%${c}`).split('%%');
                return res.length > 1 ? selector => res.join(selector) : null;
            }).filter(v => v);

            entry.selectors.forEach(targetSelector => {
                templates.forEach(template => {
                    newSelectors += ',' + template(targetSelector);
                });
            });
        });

        forEach(extendMap._, (entry:any) => {
            entry.selectors.forEach(targetSelector => {
                newSelectors += ',' + targetSelector;
            });
        });


        this.renderer.key += newSelectors;
    }
}
export default class ExtendRule extends Rule {

    className: string
    search: RegExp
    replace: RegExp
    currentParrent: ContainerRuleRenderer
    cachedTargetSelectors: Array<string>
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
            this.search = new RegExp(/()(?:prefix(?:\b)search)+(\b[^-\\]|$)/.source.replace('prefix', prefix).replace('search', search));
        } else {
            this.search = new RegExp(/((?:,|^)\s*)(?:prefix(?:\b)search)(\b\s*(?:,|$)|$)/.source.replace('prefix', prefix).replace('search', search));
        }

        this.replace  = new RegExp(this.search.source, 'g');

    }

    matches(key) {
        return ~key.indexOf(this.className) && key.match(this.search);
    }

    mark(rule) {

        if (rule instanceof ExtendRule) {
            return
        }

        const match = rule.key && rule.key.match && this.matches(rule.key);
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

    getTargetSelectors() {

        if (this.getExtender() && !this.cachedTargetSelectors) {
            this.cachedTargetSelectors = this.getExtender().key.split(', ');
        }
        return this.cachedTargetSelectors || [];
    }

    addTransform(renderer) {

        if (!renderer._extend) {
            renderer._extend = new Transformation(renderer);
            this.extend.renderers.push(renderer);
        }

        renderer._extend.rules.push(this);

    }

    collect(renderer) {

        if (renderer.key && this.matches(renderer.key)) {
            this.addTransform(renderer);
        }

    }

}
