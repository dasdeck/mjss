import {nativeFunctions} from '../../lib';

export default class Nested {

    onRender(value, name) {

        if (name === 'content') {

            const stringValue = String(value);

            if (!['"', "'"].includes(stringValue[0])) {

                const re = new RegExp(/^\b(names)\b/.source.replace('names', nativeFunctions.join('|')), 'g');
                const match = stringValue.match(re);
                if (!match) {
                    return `'${stringValue}'`;
                }
            }
        } else if (value && value.includes && !value.includes(', ')) {

            if ('font' === name && value.includes('/')) {

                const list = value.match(/.* \/ .*? (:?[^\s"]+|"([^"]*))|[^\s"]+|"([^"]*)/g);
                return list.join(', ');

            } else if (['font', 'font-family', 'transition-property'].includes(name)) {
                // debugger;
                const parts = value && value.match(/[^\s"]+|"([^"]*)"/g);
                return parts.length > 2 || name === 'transition-property' ? parts.join(', ') : parts.join(' ');
            }
        }

        return value;
    }

}

