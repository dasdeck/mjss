import ContainerRule from './ContainerRule';
import RuleListRenderer from './RuleListRenderer';
import {assign} from 'lodash';
export default class ContainerRuleRenderer extends RuleListRenderer {

    rule: ContainerRule
    key: any

    constructor(rule: ContainerRule, parent: RuleListRenderer = null) {

        super(rule.rules, parent);

        assign(this, {
            rule,
            key: rule.key
        });
    }

    patch(old) {

        if (this.key !== old.key) {
            throw 'structural mismatch';
        }
        return super.patch(old);
    }

    toString() {
        const rulesCss = super.toString();
        return rulesCss && `${this.key}{${rulesCss}}` || '';
    }
}