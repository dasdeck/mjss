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
        } else if (value && value.includes && !value.includes(', ')) {

            if ('font' === name && value.includes('/')) {

                const list = value.match(/.* \/ .*? (:?[^\s"]+|"([^"]*))|[^\s"]+|"([^"]*)/g);
                return list.join(', ');

            } else if (['font', 'transition-property'].indexOf(name) >= 0) {
                // debugger;
                const parts = value && value.match(/[^\s"]+|"([^"]*)"/g);
                return parts.length > 2 || name === 'transition-property' ? parts.join(', ') : parts.join(' ');
            }
        }

        return value;
    }

}