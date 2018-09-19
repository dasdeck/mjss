

import Sheet from './Sheet';
import Renderable from './interface/Renderable';
import Rule from './Rule';
import RuleListRenderer from './RuleListRenderer';

export default class RuleRender implements Renderable {

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

    toString() {
        this.sheet.hook('onOutput', this);
        return `${String(this.key)}:${String(this.value)};`;
    }

}

