import {startsWith} from 'lodash';
import ExtendRule from './ExtendRule';
import {patternExtend} from './lib';


/*
extend may set the result key to a renderable object because it needs to be lazy
to ensure it extends target rules with its final parent
make shure not to midify keys after they have been extended
*/

export default class Extend {

    extends: Array<ExtendRule> = []
    options: any


    constructor(options: any = {}) {
        this.options = options;
    }

    onReady(rule) {

        if (this.options.assumeStaticSelectors) {
            for (let i = 0; i < this.extends.length; i++) {
                const extend = this.extends[i];
                extend.mark(rule);
            }
        }
    }

    createRule(sheet, rules, key, list) {
        if (startsWith(key, patternExtend)) {
            const rule = new ExtendRule(sheet, rules, key, list.rule, this);
            this.extends.push(rule);
            return rule;
        }
    }

    onProcess(renderer) {

        for (let i = 0; i < this.extends.length; i++) {
            const extend = this.extends[i];
            extend.collect(renderer);
        }

    }

    onBeforeOutput() {

        for (let i = 0; i < this.extends.length; i++) {
            const extend = this.extends[i];
            extend.apply();
        }

    }

};
