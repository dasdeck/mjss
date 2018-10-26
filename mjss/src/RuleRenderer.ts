

import Stringable from './interface/Stringable';
import Rule from './Rule';

export default class RuleRender implements Stringable {

    rule: Rule
    key: string
    value: string

    constructor(rule:Rule) {

        this.rule = rule;
        this.key = rule.key;
        this.value = rule.value instanceof Object ? rule.value.toString() : rule.value;

    }

    patch(old) {

        if (this.key !== old.key) {
            throw 'structural mismatch';
        }

        if (old.value !== this.value) {
            old.value = this.value;
            const important = this.value.indexOf('!important');
            const priority = ~important ? 'important' : undefined;
            return {
                key: this.key,
                value: priority ? this.value.substring(0, important).trim() : this.value,
                priority

            }
        }
    }

    toString() {
        return `${this.key}:${this.value};`;
    }

}

