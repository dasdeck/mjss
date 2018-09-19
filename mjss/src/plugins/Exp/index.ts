import {isPlainObject} from 'lodash';
import EnvRule from './EnvRule';
import {isEvaluable} from './lib';
import DynamicContainerRule from './DynamicContainerRule';
import DynamicRule from './DynamicRule';


export default class Exp {

    options: any
    env: EnvRule

    constructor(options = {forceUniqueKeys: false, context: {}, env: {}}) {
        this.options = options;
    }

    onInit(sheet) {
        this.env = new EnvRule(sheet, this, sheet.data['@env']);
    }

    createRule(sheet, rules, key, parent) {
        if (key === '@env') {
            return this.env;
        } else if (isEvaluable(key) && isPlainObject(rules)) {
            return new DynamicContainerRule(sheet, rules, key, parent, this)
        } else if (isEvaluable(key) || isEvaluable(rules)) {
            return new DynamicRule(sheet, rules, key, parent, this)
        }
    }


};




