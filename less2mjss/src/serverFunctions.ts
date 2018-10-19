import {unQuote} from './lib';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

export const staticFunctions = {

    inline(url, mimeType = 'image/svg+xml', inlineSearch = null) {

        url = unQuote(url);

        if (inlineSearch) {
            const globSearch = path.join(inlineSearch, url.replace(/\.\.\//g, ''));
            const res = glob.sync(globSearch);
            if (res.length > 1) {
                debugger;
            }
            url = res[0];
        }

        if (fs.existsSync(url)) {
            const svgData = fs.readFileSync(url, 'utf8');
            return svgData;
        }

    }

}