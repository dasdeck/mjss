import * as path from 'path';
import * as fs from 'fs';

export function concatLessSource(fileName) {

    const input = fs.readFileSync(fileName, 'utf8');


    return input.replace(/^\s?@import "(.*?)";/gm, (line, file) => {
        const subDir = path.dirname(fileName);
        const prefix = `@component: "${file}";\n`;
        const filePath = path.join(subDir, file);

        if (fs.existsSync(filePath)) {
            return prefix + concatLessSource(filePath);
        } else {
            console.log('extern:' + file);
            return line;
        }
    });
}