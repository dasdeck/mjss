import ContainerRule from "../../ContainerRule";
import ContainerRuleRenderer from "../../ContainerRuleRenderer";
import {makeExpressive} from "./lib";
import Sheet from "../../Sheet";
import Rule from "../../Rule";
import Exp from ".";
import Environment from "./Environment";

export default class DynamicContainerRule extends ContainerRule {

    exp: Exp
    env: Environment

    constructor(sheet:Sheet, data:any, key:string, parent:Rule, exp:Exp) {

        super(sheet, data, key, parent);
        this.exp = exp;
        this.env = exp.env;
        const context = this.env.getContext();

        makeExpressive(this, 'key', {...context, $rule: this});
    }

    render(renderer: ContainerRuleRenderer) {
        const key = this.key;
        if (key instanceof Object && key.render) {
            key.render(renderer);
        } else if (key === true) {
            this.rules.render(renderer);
        } else if (key !== false) {
            super.render(renderer);
        }
    }
}
