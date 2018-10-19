import {unQuote} from './lib';
import * as fs from 'fs';

export const staticFunctions = {

    inline(url, mimeType = 'image/svg+xml') {

        url = unQuote(url);
        if (fs.existsSync(url)) {
            const svgData = fs.readFileSync(url, 'utf8');
            return `data:${unQuote(mimeType)},${encodeURIComponent(svgData)}`;
        } else {
            return url;
        }

    }

}