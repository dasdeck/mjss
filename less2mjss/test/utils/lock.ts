import {concatLessSource} from '.'
import {less2mjss} from '../../src';
import functions from '../../src/lib';
import {Sheet, Exp, Extend, Cleanup, Nest} from 'mjss';

import * as path from 'path';
import * as fs from 'fs';

const uikitSourceDir = path.resolve(path.join(require.resolve('uikit'), '/../../../src/less/uikit.less'));

export const uikit = concatLessSource(uikitSourceDir);

export const lockOptions = {
    plugins: [
        new Exp({env: functions}),
        new Nest,
        new Extend,
        new Cleanup
    ]
};


if (~process.argv.indexOf('write')) {


    const uikitMjss = less2mjss(uikit);

    const sheet = new Sheet(lockOptions, uikitMjss);

    debugger

    fs.writeFileSync(path.join(__dirname, '../data/uikit.lock.json'), JSON.stringify(uikitMjss, null, 2))
    fs.writeFileSync(path.join(__dirname, '../data/uikit.lock.css'), sheet.toString())
}