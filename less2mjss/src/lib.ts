import lessFunctions from './lessFunctions';
import {mapKeys} from 'lodash';
import {UnitNumber} from 'mjss-css-utils';
import * as fs from 'fs';

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
    // e: lessFunctions.e
    'data-uri'(mimeType, url) {

        if (!url) {
            url = mimeType;
            mimeType = 'image/svg+xml';
        }

        // console.log({
        //     url,
        //     cwd: process.cwd()
        // })
        url = unQuote(url);
        if (fs.existsSync(url)) {
            const svgData = fs.readFileSync(url, 'utf8');
            return `url("data:${unQuote(mimeType)},${encodeURIComponent(svgData)}")`;
        } else {
            return `url("${url}")`;
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

