
import * as suites from '..';
import {pickBy, isObject, forEach, mapKeys} from 'lodash';
import {UnitNumber} from '../../';

/* generates test with bdd style commands */

forEach(pickBy(suites, suite => isObject(suite) && suite.tests), (block:any, name) => {

    describe(name, () => {

        forEach(block.tests, (row, desc) => {

            it(row.desc || desc || row.expression, () => {

                const context = {...mapKeys(UnitNumber.operations, op => op.name), ...row.context};
                const func = new Function('context', `with(context) { return ${row.expression}; }`);

                if(row.exception) {
                    expect(() => String(func(context))).toThrowError(row.exception)
                } else {
                    expect(String(func(context))).toBe(row.result);
                }

            });

        });
    });
});
