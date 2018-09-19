import {isObject, mapValues, isFunction} from 'lodash';
import ContainerRule from './ContainerRule';
import Sheet from './Sheet';
import Rule from './Rule';
import RuleListRenderer from './RuleListRenderer';

export default class RuleList {

    sheet: Sheet
    args: Array<any>
    rules: object
    rule: Rule

    constructor(sheet:Sheet, data:any = sheet.data, rule:Rule = null) {

        this.sheet = sheet;
        this.rule = rule;
        this.rules = mapValues(data, (row, key) => this.createRule(row, key));

        this.sheet.hook('onCreate', this);

    }

    createRule(data:any, key:string) {

        let rule = this.sheet.hook('createRule', this.sheet, data, key, this);
        if (!rule) {
            if (!isObject(data) || isFunction(data)) {
                rule = new Rule(this.sheet, data, key, this.rule);
            } else {
                rule = new ContainerRule(this.sheet, data, key, this.rule);
            }
        }
        return rule;
    }

    render(renderer:RuleListRenderer) {
        for (const key in this.rules) {
            const rule = this.rules[key];
            rule.render(renderer);
        }
    }


}
