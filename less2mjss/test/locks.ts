import * as fs from 'fs';
import * as path from 'path';

import {uikit} from './utils/lock';

import {lockOptions} from './utils/lock';
import {Sheet} from 'mjss';

export default {
    tests: {

        'uikit lock css': {
            jss: JSON.parse(fs.readFileSync(path.join(__dirname, './data/uikit.lock.json'), 'utf8')),
            css: fs.readFileSync(path.join(__dirname, './data/uikit.lock.css'), 'utf8'),
            test(less2jss, {compare}) {
                const sheet = new Sheet(lockOptions, this.jss);
                const css = sheet.toString();
                compare(css, this.css);
            },
            roundtrip: false

        },
        'uikit lock jss': {
            less: uikit,
            jss: JSON.parse(fs.readFileSync(path.join(__dirname, './data/uikit.lock.json'), 'utf8')),
            roundtrip: false,
            test(less2jss, {compare}) {
                const jss = less2jss(this.less);
                compare(jss, this.jss);
            }
        }
    }
}