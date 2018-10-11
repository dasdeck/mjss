import Rule from "../../Rule";
import { Exp } from "..";
import ContainerRule from "../../ContainerRule";
import Import from "../../Import";
import { isFunction, isPlainObject, mapValues, last } from "lodash";
import MixinCall from "./MixinCall";
import { Sheet } from "../../..";

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
export default class Environment {
    stack: Stack = new Stack()
    exp: Exp
    cache: any = {}
    context: any
    rules:any = {}
    sheet: Sheet

    constructor(exp: Exp, sheet: Sheet) {

        this.exp = exp;
        this.sheet = sheet;

        this.stack.push({});
        this.createContext();

        this.exp.options.env = this.exp.options.env || {}


    }

    buildCache() {

        this.cache = mapValues(this.rules, (rule:Rule) => rule instanceof ContainerRule ? rule : rule.value);

    }


    get(key) {
        if (key in this.stack.head) {
            return this.stack.head[key];
        } else if (key in this.exp.options.env) {
            return this.exp.options.env[key]
        } else if (key in this.cache) {
            return this.cache[key];
        } else if (key in this.rules) {
            const rule = this.rules[key]
            return rule instanceof ContainerRule ? rule : rule.value;
        } else if (key in this.context) {
            return this.context[key];
        }
    }

    createContext(){
        const self = this;
        this.context = {
            ...this.exp.options.context,
            group(name) {
                return true;
            },
            import(url) {
                return new Import(self.sheet, url);
            },
            unquote(arg) {
                return ~['"', "'"].indexOf(arg[0]) ? arg.substr(1, arg.length - 2) : arg;
            },
            nf(name, ...args) {
                return `${name}(${args.join(', ')})`
            },
            env(name) {
                return self.get(name);
            },
            envu(arg) {
                return this.unquote(this.env(arg));
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
