import Rule from "../../Rule";
import {makeExpressive} from "./lib";
import Exp from ".";
import Environment from "./Environment";

export default class DynamicRule extends Rule {

    exp: Exp
    env: Environment

    constructor(sheet, data, key, parent, exp) {
        super(sheet, data, key, parent);

        this.exp = exp;
        this.env = exp.env;

        const context = this.env.getContext();

        makeExpressive(this, 'key', {...context, $rule: this});
        makeExpressive(this, 'value', {...context, $rule: this});
    }
}

