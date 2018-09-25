

import {less2mjss} from 'less2mjss';
import {concatLessSource} from 'less2mjss/test/utils'

import * as path from 'path';
import * as fs from 'fs';
const file = process.argv[2];

// fs.existsSync(file)

const lessSource = concatLessSource(file);

const mjss = less2mjss(lessSource);

const targetFileName = path.join(process.cwd(), path.basename(file).replace('.less', '.json'));

fs.writeFileSync(targetFileName, JSON.stringify(mjss, null, 2));