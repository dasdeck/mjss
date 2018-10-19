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

export function unQuote(string) {
    return string[0] === '"' || string[0] === "'" ? string.substr(1,string.length - 2) : string;
}

export const staticFunctions = {

    inline(url, mimeType = 'image/svg+xml') {

        console.warn('resources can not be inlined in browser')
        return url;
    },

    'data-uri'(mimeType, url) {

        if (!url) {
            url = mimeType;
            mimeType = null;
        }

        return `url("${this.inline(url, mimeType)}")`;
    },

    'svg-fill'(src, defaultColor, newColor, property = "'background-image'") {

        const svgData = this.inline(src, 'image/svg+xml;charset=UTF-8');
        const code = `'${svgData}'.replace(new RegExp(encodeURIComponent(${defaultColor}), 'g'), ${newColor})`;
        const value = '`url("${' + code + '}")`';

        const prop = "`${" + property + "}`";

        return {
            [prop]: value
        }

    }
};

interface Function {
    name: string;
}

export const functions = {
    ...customMixinFunctions,
    ...lessFunctions,
    ...mapKeys(lessFunctions, (func:Function, key) => func.name),
    ...UnitNumber.operations

};

// provide all functions for execution
export default functions;

