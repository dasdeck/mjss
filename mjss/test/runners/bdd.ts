
import * as suites from '..';
import {pickBy, isObject, forEach} from 'lodash';
import Sheet from '../../src/Sheet';
import {css_beautify} from 'js-beautify';

/* generates test with bdd style commands */

forEach(pickBy(suites, suite => isObject(suite) && (suite as any).tests), (block:any, name) => {

    const compare = (a, b) => expect(a).toBe(b);
    describe(name, () => {

        forEach(block.tests, (row, desc) => {

            it(row.desc || desc || row.css, () => {

                const options = block.options ? block.options(row) : {plugins: []};
                const sheet = new Sheet(options, row.jss);
                if (row.test) {

                    row.test(sheet, {compare})
                } else {
                    compare(css_beautify(sheet.toString()), css_beautify(row.css));
                }


            });

        });
    });
});
