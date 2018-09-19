import Rule from "../../Rule";
import {makeExpressive} from "./lib";
import Exp from ".";
import EnvRule from "./EnvRule";

export default class DynamicRule extends Rule {

    exp: Exp
    env: EnvRule

    constructor(sheet, data, key, parent, exp) {
        super(sheet, data, key, parent);

        this.exp = exp;
        this.env = exp.env;

        const context = this.env.getContext();

        makeExpressive(this, 'key', context);
        makeExpressive(this, 'value', context);
    }
}

