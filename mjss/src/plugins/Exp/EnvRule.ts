// import ContainerRule from "../../ContainerRule";
import ContainerRuleRenderer from "../../ContainerRuleRenderer";
import Exp from ".";
import {isPlainObject, cloneDeep} from 'lodash';
import { Sheet } from "../../..";
import Rule from "../../Rule";

import {iteratedMerge} from '../../util';

export default class EnvRule extends Rule {

    exp: Exp

    constructor(sheet: Sheet, exp: Exp, data = {}) {
        super(sheet, data,'@env', null);
        this.exp = exp;

        for (const key in data) {

            const ruleToAdd = data[key];

            if (key in this.exp.env.rules && isPlainObject(ruleToAdd))  {

                const rule = this.exp.env.rules[key];
                const copy = {};
                for (const k in rule) {
                    copy[k] = rule[k];
                }

                this.exp.env.rules[key] = iteratedMerge(copy, ruleToAdd);
            } else {
                this.exp.env.rules[key] = ruleToAdd;
            }

        }
    }

    render(renderer: ContainerRuleRenderer) {
        return '';
    }


}