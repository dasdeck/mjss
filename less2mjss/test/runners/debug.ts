
import * as suites from '..';
import {pickBy, isObject, forEach} from 'lodash';
import less2jss from '../../src';

/* generates test with bdd style commands */

const compare = (a, b) => expect(a).toEqual(b);

function run(row) {
    if (row.test) {
        row.test(less2jss, {compare})
    } else {
        const jss = less2jss(row.less);
    }
    console.log(row);
}

forEach(pickBy(suites, suite => isObject(suite) && suite.tests), (block:any, name) => {

    block.tests.forEach(row => {
        run(row);
    });
});
