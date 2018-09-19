import lessFunctions from './lessFunctions';
import {mapKeys} from 'lodash';
import {UnitNumber} from 'mjss-css-utils';

export const operatorMap = {
    '*': 'mul',
    '+': 'add',
    '-': 'sub',
    '/': 'div'
};


export const customMixinFunctions = {
    'svg-fill'({src, defaultColor, newColor, property = 'background-image'}) {

        return {
            [property]: `url(${src})`
        };
    }

};

export const staticFunctions = {
    // e: lessFunctions.e
};

export const functions = {
    env(key) { return this[`${key}`]; },
    nf: (name, ...args) => `${name}(${args.join(', ')})`,
    ...customMixinFunctions,
    ...lessFunctions,
    ...mapKeys(lessFunctions, (func, key) => func.name),
    ...UnitNumber.operations

};

// provide all functions for execution
export default functions;
