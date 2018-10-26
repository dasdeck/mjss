import {values} from "lodash";
import Exp from ".";
import ContainerRule from "../../ContainerRule";
import ContainerRuleRenderer from "../../ContainerRuleRenderer";
import RuleRenderer from "../../RuleRenderer";
import Renderable from "../../interface/Renderable";
import Environment from "./Environment";

export default class MixinCall implements Renderable {

    env: Environment
    exp: Exp
    args: Array<any>
    rule: ContainerRule

    constructor(rule:ContainerRule|object, args:any, env: Environment) {
        this.exp = env.exp;
        this.env = env;
        if (!(rule instanceof ContainerRule)) {
            rule = env.sheet.rules.createRule(rule, '@mixin');

            if (!(rule instanceof ContainerRule)) {
                throw 'invalid mixin';
            }

        }
        this.rule = rule;
        this.args = args;
    }

    render(renderer:ContainerRuleRenderer) {

        this.env.stack.push(this.args);

        this.rule.rules.render(renderer);

        if (this.exp.options.forceUniqueKeys) {

            const toString = renderer.toString;
            renderer.toString = function() {
                forceUniqueKeys(this);
                return toString.call(this);
            }
        }

        this.env.stack.pop();

    }
}

function forceUniqueKeys(renderer:ContainerRuleRenderer) {
    let i = 0;
    renderer.children = values(renderer.children.reduce((last, next) => {
        if (next instanceof RuleRenderer) {
            last[next.key] = next;
        } else if(next instanceof ContainerRuleRenderer) { //containerRules can be double
            last[i++] = next;
        }
        return last;
    }, {}));
}
