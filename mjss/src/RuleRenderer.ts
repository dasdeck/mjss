

import Sheet from './Sheet';
import Stringable from './interface/Stringable';
import Rule from './Rule';
import RuleListRenderer from './RuleListRenderer';

export default class RuleRender implements Stringable {

    rule: Rule
    key: string
    value: string
    sheet: Sheet
    parent: RuleListRenderer

    constructor(rule:Rule, parent: RuleListRenderer) {

        this.parent = parent;
        this.sheet = rule.sheet;
        this.rule = rule;
        this.key = rule.key;
        this.value = rule.value;

    }

    toRule() {
        return {
            key: this.key,
            value: String(this.value),
            class: 'RuleRenderer'
        }
    }

    toString() {
        return `${this.key}:${String(this.value)};`;
    }

}

