
import * as suites from '..';
import {pickBy, isObject, forEach, isString} from 'lodash';
import {Sheet, Exp, Nest, Extend} from 'mjss';

import * as less from 'less';
import {css_beautify} from 'js-beautify';
import { less2mjss, functions } from 'less2mjss';

/* generates test with bdd style commands */

forEach(pickBy(suites, suite => isObject(suite) && suite.tests), (block:any, name) => {

    const compare = (a, b) => expect(a).toEqual(b);

    describe(name, () => {

        forEach(block.tests, (row, desc) => {

            const lessOnly = isString(row);
            const lessString = lessOnly ? row : row.less;

            desc = row.desc || desc || row.less;

            const testCall = row.focus ? it.only : it;

            const env = functions;
            const options = {plugins: [
                new Exp({env}),
                new Nest,
                new Extend,
            ]};

            if (row.test) {

                testCall(desc, () => {
                    row.test(less2mjss, {compare})
                });

            }

            let lessCss;
            let jss = row.jss;
            let jssCss;

            if (lessString) {
                jss = less2mjss(lessString);
                less.render(lessString, (err, res) => {
                    lessCss = css_beautify(res.css);
                });
            }

            const sheet = new Sheet(options, jss);

            jssCss = css_beautify(sheet.toString());

            if (row.jss && row.less) {

                testCall(desc, () => {
                    compare(jss, row.jss)
                });

            } else if (row.css && row.jss) {
                testCall(desc, () => {
                    compare(jssCss, row.css)
                });
            }

            if (lessCss && jssCss && row.roundtrip !== false) {
                testCall(`${desc}(round-trip)${lessOnly ? lessCss.split('\n').join('') : ''}`, () => {
                    compare(jssCss, lessCss);
                });
            }

            if (lessCss && row.css) {
                testCall(`${desc}(expected css)`, () => {
                    compare(css_beautify(row.css), lessCss);
                });
            }

        });
    });
});
