import ContainerRule from "../../ContainerRule";
import ContainerRuleRenderer from "../../ContainerRuleRenderer";
import Exp from ".";
import {assign} from 'lodash';


export default class EnvRule extends ContainerRule {

    exp: Exp

    constructor(sheet, exp: Exp, data = {}) {
        super(sheet, data, '@env'); // pass empty data to avoid loading rules immediatly
        this.exp = exp;
        this.exp.env.rules = {...this.exp.env.rules, ...this.rules.rules};
    }

    render(renderer: ContainerRuleRenderer) {
        return '';
    }


}