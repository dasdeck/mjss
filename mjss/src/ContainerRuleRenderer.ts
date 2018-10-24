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

    toRule():any {
        return this.children.length && {
            key: this.key,
            children: this.children.map((child:any) => child.toRule()).filter(c => c),
            class: 'ContainerRuleRenderer'
        }
    }

    toString() {
        const rulesCss = super.toString();
        return rulesCss && `${this.key}{${rulesCss}}` || '';
    }
}