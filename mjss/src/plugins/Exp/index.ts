import EnvRule from './EnvRule';
import {isEvaluable} from './lib';
import DynamicContainerRule from './DynamicContainerRule';
import DynamicRule from './DynamicRule';
import { isPlainObject } from "lodash";
import Environment from './Environment';

export default class Exp {

    options: any
    env: Environment

    constructor(options: any = {forceUniqueKeys: false, cacheEnv: false, context: {}, env: {}}) {
        this.options = options;
    }

    onInit(sheet) {
        this.env = new Environment(this, sheet); //new EnvRule(sheet, this, sheet.data['@env']);
    }

    onSheetReady(sheet) {
        this.env.prepare();
    }

    createRule(sheet, rules, key, parent) {
        if (key === '@env') {
            return new EnvRule(sheet, this, rules);
        } else if (isEvaluable(key) && isPlainObject(rules)) {
            return new DynamicContainerRule(sheet, rules, key, parent, this)
        } else if (isEvaluable(key) || isEvaluable(rules)) {
            return new DynamicRule(sheet, rules, key, parent, this)
        }
    }

};
