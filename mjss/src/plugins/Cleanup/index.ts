import {nativeFunctions} from 'mjss-css-utils';
export default class Cleanup {

    onOutput(renderer) {

        const name = renderer.key;
        const value = renderer.value;

        if (name === 'content') {

            const stringValue = String(value);

            if (`"'`.indexOf(stringValue[0]) < 0) {

                const re = new RegExp(/^\b(names)\b/.source.replace('names', nativeFunctions.join('|')), 'g');
                const match = stringValue.match(re);
                if (!match) {
                    renderer.value = `'${stringValue}'`;
                }
            }
        }

        return value;
    }

}