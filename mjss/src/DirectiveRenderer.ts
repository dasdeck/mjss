

import Sheet from './Sheet';
import Stringable from './interface/Stringable';
import RuleListRenderer from './RuleListRenderer';
import Directive from './Directive';

export default class DirectiveRenderer implements Stringable {

    rule: Directive
    value: string
    sheet: Sheet
    parent: RuleListRenderer

    constructor(rule:Directive, parent: RuleListRenderer) {

        this.parent = parent;
        this.sheet = rule.sheet;
        this.rule = rule;
        // fastes way of convert to string of number
        this.value = rule.value instanceof Object ? rule.value.toString() : rule.value;

    }

    patch(old)  {
        const newValue = this.value;
        if (this.value !== newValue) {
            old.value = newValue;
            return {
                value: this.value,
            }
        }

    }

    toString() {
        return `${this.value};`;
    }

}

