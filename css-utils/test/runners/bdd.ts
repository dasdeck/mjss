
import * as suites from '..';
import {pickBy, isObject, forEach, mapKeys} from 'lodash';
import {UnitNumber} from '../../';

/* generates test with bdd style commands */

forEach(pickBy(suites, suite => isObject(suite) && suite.tests), (block:any, name) => {

    describe(name, () => {

        block.tests.forEach(row => {

            it(row.desc || row.expression, () => {

                const context = {...mapKeys(UnitNumber.operations, op => op.name), ...row.context};
                const func = new Function('context', `with(context) { return ${row.expression}; }`);
                expect(String(func(context))).toBe(row.result);

            });

        });
    });
});
