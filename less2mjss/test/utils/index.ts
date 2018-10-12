import * as path from 'path';
import * as fs from 'fs';
import {Sheet, Exp, Nest, Extend} from 'mjss';
import { functions } from 'less2mjss';



export function replaceLessSource(source, subDir = process.cwd()) {
    return source.replace(/^\s?@import "(.*?)";/gm, (line, file) => {
        const filePath = path.isAbsolute(file) ? file : path.join(subDir, file);
        const prefix = `@component: "${filePath}";\n`;


        if (fs.existsSync(filePath)) {
            return prefix + concatLessSource(filePath);
        } else {
            console.log('extern:' + file);
            return line;
        }
    });
}

export function concatLessSource(fileName) {

    const input = fs.readFileSync(fileName, 'utf8');

    return replaceLessSource(input, path.dirname(fileName));

}

export function stripComments(input) {
    return input.replace(/\/\*(.|\n)*?\*\//gm, '').split('\n').filter(line => line.trim().substr(0, 2) !== '//').join('\n');
}

export function createSheet(jss) {

    const env = functions;
    const options = {plugins: [
        new Exp({env}),
        new Nest,
        new Extend,
    ]};

    return new Sheet(options, jss);
}