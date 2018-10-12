import {mapValues} from 'lodash';
import Sheet from './Sheet';
import Rule from './Rule';
import RuleListRenderer from './RuleListRenderer';
import Renderable from './interface/Renderable';

export default class RuleList implements Renderable {

    sheet: Sheet
    args: Array<any>
    rules: object
    rule: Rule

    constructor(sheet:Sheet, data:any = sheet.data, rule:Rule = null) {

        this.sheet = sheet;
        this.rule = rule;
        this.rules = mapValues(data, (row, key) => this.createRule(row, key));

    }

    createRule(data:any, key:string) {
        return this.sheet.createRule(data, key, this.rule);
    }

    render(renderer:RuleListRenderer) {
        for (const key in this.rules) {
            const rule = this.rules[key];
            rule.render(renderer);
        }
    }


}
