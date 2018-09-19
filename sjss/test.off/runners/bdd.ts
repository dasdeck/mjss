
import {tests as suites} from 'mjss';
import {pickBy, isObject, forEach} from 'lodash';
import {create} from '../../src';
import Exp from '../../src/plugins/expression';

/* generates test with bdd style commands */


forEach(pickBy(suites, suite => isObject(suite) && suite.tests), (block:any, name) => {

    const compare = (a, b) => expect(a).toBe(b);
    return;

    describe(name, () => {

        forEach(block.tests, (row, desc) => {

            it(row.desc || desc || row.css, () => {

                const compiler = create();
                compiler.use(new Exp);

                // const sheet = compiler.createStylesheet(row.jss);
                // const res = sheet.toString();
                // debugger

                // const options = block.options ? block.options(row) : {plugins: []};
                // const sheet = new Sheet(options, row.jss);
                // if (row.test) {

                //     row.test(sheet, {compare})
                // } else {
                //     compare(sheet.toString(), row.css)
                // }


            });

        });
    });
});
