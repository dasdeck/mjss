

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
        this.value = rule.value;

    }

    toRule():any  {
        return {
            value: this.value,
            class: 'DirectiveRenderer'
        }
    }

    toString() {
        return `${this.value};`;
    }

}

