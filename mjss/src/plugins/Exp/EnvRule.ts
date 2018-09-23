import ContainerRule from "../../ContainerRule";
import ContainerRuleRenderer from "../../ContainerRuleRenderer";
import MixinCall from "./MixinCall";
import Exp from ".";
import { isFunction, isPlainObject, mapValues, last } from "lodash";
import Rule from "../../Rule";

class Stack {


    head: any
    values: Array<any> = []

    push(value) {
        this.head = value;
        this.values.push(value);
    }

    pop() {
        this.values.pop();
        this.head = last(this.values);
    }

}

export default class EnvRule extends ContainerRule {

    context: any
    exp: Exp
    stack: Stack = new Stack()
    cache: any = {}


    constructor(sheet, exp: Exp, data = {}) {
        super(sheet, {}, '@env'); // pass empty data to avoid loading rules immediatly
        this.exp = exp;

        this.stack.push({});

        this.exp.options.env = this.exp.options.env || {}

        this.createContext();

        this.exp.env = this;
        // load rules after setting exp.env member
        this.setRules(data);

        if (this.exp.options.cacheEnv) {
            this.buildCache();
        }
    }

    render(renderer: ContainerRuleRenderer) {
        return '';
    }

    buildCache() {

        this.cache = mapValues(this.rules.rules, (rule:Rule) => rule instanceof ContainerRule ? rule : rule.value);

    }

    get(key) {
        if (key in this.stack.head) {
            return this.stack.head[key];
        } else if (key in this.exp.options.env) {
            return this.exp.options.env[key]
        } else if (key in this.cache) {
            return this.cache[key];
        } else if (key in this.rules.rules) {
            const rule = this.rules.rules[key]
            return rule instanceof ContainerRule ? rule : rule.value;
        }
    }

    createContext(){
        const self = this;
        this.context = {
            ...this.exp.options.context,
            nf(name, ...args) {
                return `${name}(${args.join(', ')})`
            },
            env(name) {
                return self.get(name);
            },
            call(name, mixinArg = {}, ...args) {
                let member = self.get(name)
                while (isFunction(member)) {
                    member = member(mixinArg, ...args);
                }
                return member instanceof Rule || isPlainObject(member) ? new MixinCall(member, mixinArg, self) : member;
            }

        };
    }

    getContext() {
        return this.context;
    }

}