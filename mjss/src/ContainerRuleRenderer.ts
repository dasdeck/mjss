import ContainerRule from './ContainerRule';
import RuleListRenderer from './RuleListRenderer';
import {assign} from 'lodash';
export default class ContainerRuleRenderer extends RuleListRenderer {

    rule: ContainerRule
    key: any
    value: any

    constructor(rule: ContainerRule, parent: RuleListRenderer = null) {

        super(rule.rules, parent);

        assign(this, {
            rule,
            key: rule.key,
            value: rule.value
        });
    }

    toString() {
        const rulesCss = super.toString();
        return rulesCss && `${this.key}{${rulesCss}}` || '';
    }
}