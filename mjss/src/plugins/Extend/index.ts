import {startsWith} from 'lodash';
import ExtendRule from './ExtendRule';
import {patternExtend} from './lib';


/*
extend may set the result key to a renderable object because it needs to be lazy
to ensure it extends target rules with its final parent
make shure not to midify keys after they have been extended
*/

export default class Extend {

    extends: any = {}
    options: any
    renderers: any = {}

    constructor(options: any = {}) {
        this.options = options;
    }

    onReady(rule) {

        if (this.options.assumeStaticSelectors) {
            for (const i in this.extends) {
                const extend = this.extends[i];
                extend.mark(rule);
            }
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

        for (const i in this.extends) {
            const extend = this.extends[i];
            extend.apply();
        }

    }

};
