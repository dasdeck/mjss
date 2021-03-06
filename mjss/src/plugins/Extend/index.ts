import {startsWith, forEach, assign} from 'lodash';
import ExtendRule from './ExtendRule';
import {patternExtend} from './lib';

/*
extend may set the result key to a render-able object because it needs to be lazy
to ensure it extends target rules with its final parent
make sure not to modify keys after they have been extended
*/

export default class Extend {

    extends: any
    options: any
    renderers: Array<any>

    constructor(options: any = {}) {
        this.options = options;
    }

    onInit() {
        this.extends = {};
    }

    onBeforeRender() {
        this.renderers = [];
    }

    onReady(rule) {

        for (const i in this.extends) {
            const extend = this.extends[i];
            extend.mark(rule);
        }

    }

    createRule(sheet, rules, key, list) {

        if (startsWith(key, patternExtend)) {
            const rule = new ExtendRule(sheet, rules, key, list.rule, this);
            this.extends[rule.id] = rule;
            return rule;
        }

    }

    onProcess(renderer) {

        if (this.options.assumeStaticSelectors) {

            if (renderer.rule._extend) {
                for (const i in renderer.rule._extend) {
                    this.extends[i].addTransform(renderer);
                }
            }

        } else {

            for (const i in this.extends) {
                const extend = this.extends[i];
                extend.collect(renderer);
            }

        }

    }

    onBeforeOutput() {
        this.renderers.forEach(renderer => renderer._extend.apply())
    }

    /**
     * helper function to transfer extend markings in nest plugin
     * @param renderer
     * @param oldKey
     */

    onSelectorChanged(renderer) {

        if (this.options.assumeStaticSelectors) {

            delete renderer.rule._extend;

            /* istanbul ignore next */
            if (renderer._extend) {
                delete renderer._extend.rules;
            }
            forEach(this.extends, extendRule => {
                extendRule.collect(renderer);
            });
        }

    }

};
