
import * as suites from '..';
import {pickBy, isObject, forEach, isString} from 'lodash';
import less2jss from '../../src/index';
import {Sheet, Exp, Nest, Extend} from 'mjss';
import lessFunctions from '../../src/lessFunctions';
import {UnitNumber} from 'mjss-css-utils';

import * as less from 'less';
import {css_beautify} from 'js-beautify';
/* generates test with bdd style commands */

forEach(pickBy(suites, suite => isObject(suite) && suite.tests), (block:any, name) => {

    const compare = (a, b) => expect(a).toEqual(b);
    describe(name, () => {

        forEach(block.tests, (row, desc) => {

            const lessString = isString(row) ? row : row.less;

            desc = row.desc || desc || row.less;

            if (row.test) {

                it(desc, () => {
                    row.test(less2jss, {compare})
                });
            }

            else if (row.jss) {

                it(desc, () => {
                    const jss = less2jss(lessString);
                    compare(jss, row.jss)
                });
            }

            if (lessString) {

                it(`${desc}(round-trip)`, () => {
                    const jss = less2jss(lessString);
                    const env = {...lessFunctions, ...UnitNumber.operations};
                    const options = {plugins: [new Exp({env}), new Extend, new Nest]}
                    const sheet = new Sheet(options, jss);
                    const jssCss = sheet.toString();

                    less.render(lessString, (err, res) => {

                        compare(css_beautify(jssCss), css_beautify(res.css));

                    })
                })
            }

        });
    });
});
