import * as path from 'path';
import * as fs from 'fs';

export function replaceLessSource(source, subDir = process.cwd()) {
    return source.replace(/^\s?@import "(.*?)";/gm, (line, file) => {
        const prefix = `@component: "${file}";\n`;

        const filePath = path.isAbsolute(file) ? file : path.join(subDir, file);

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