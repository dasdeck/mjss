import * as fs from 'fs';
import * as path from 'path';

import {uikit} from './utils/lock';

import {lockOptions} from './utils/lock';
import {Sheet} from 'mjss';
import {performance} from 'perf_hooks';

const jss = JSON.parse(fs.readFileSync(path.join(__dirname, './data/uikit.lock.json'), 'utf8'));
const css = fs.readFileSync(path.join(__dirname, './data/uikit.lock.css'), 'utf8');

const times:any = {

}

times.startTime = performance.now();
const sheet = new Sheet(lockOptions(), jss);
times.cratedTime = performance.now();
sheet.toString();
times.stringTime = performance.now();

export default {
    tests: {

        // [`uikit lock (jss => css) (ast:${times.cratedTime - times.startTime}ms css:${times.stringTime - times.cratedTime}ms)`]: {
        //     jss,
        //     css,
        //     roundtrip: false
        // },

        // 'uikit lock (less => jss)': {
        //     less: uikit,
        //     jss,
        //     roundtrip: false
        // }

    }
}