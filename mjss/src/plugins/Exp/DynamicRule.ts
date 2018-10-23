import Rule from "../../Rule";
import {makeExpressive, toVarName, createExpression} from "./lib";
import Exp from ".";
import Environment from "./Environment";

export default class DynamicRule extends Rule {

    exp: Exp
    env: Environment

    constructor(sheet, data, key, parent, exp) {
        super(sheet, data, key, parent);

        this.exp = exp;
        this.env = exp.env;

        const context = {...this.env.getContext(), $rule: this};

        makeExpressive(this, 'key', context);

        if (exp.options.extractExpressions && parent) {

            const name = toVarName(data);
            if (!this.exp.env.extractedExpressions[name]) {

                this.exp.env.extractedExpressions[name] = {
                    eval: createExpression(data, context),
                    expression: data,
                    name
                };
            } else if (this.exp.env.extractedExpressions[name].expression !== data) {
                throw 'unexpected expression name collision';
            }

            this.value = `var(${name})`;
        } else {

            makeExpressive(this, 'value', context);
        }
    }
}

