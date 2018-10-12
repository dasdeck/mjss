// import ContainerRule from "../../ContainerRule";
import ContainerRuleRenderer from "../../ContainerRuleRenderer";
import Exp from ".";
import {merge, isPlainObject, size} from 'lodash';
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

            // if (size(ruleToAdd)) {

                if (key in this.exp.env.rules && isPlainObject(ruleToAdd))  {

                    const merged = merge({}, this.exp.env.rules[key]);

                    iteratedMerge(merged, ruleToAdd);
                    this.exp.env.rules[key] = merged;
                } else {
                    this.exp.env.rules[key] = ruleToAdd;
                }
            // }

        }
    }

    render(renderer: ContainerRuleRenderer) {
        return '';
    }


}