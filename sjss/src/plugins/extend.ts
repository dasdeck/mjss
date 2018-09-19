import {forEach, isPlainObject} from 'lodash';
import {iterate, replaceKey} from './lib';

const reExtend = /^@extend (.*)/;

export default class Extends {
    constructor(options = {context: {}}) {
        this.options = options;
    }

    onRuleO(node, key, parent, style) {
        // Regex match key
        const selectorToAdd = key;
        let param;

        isPlainObject(node) && forEach(node, (value, key) => {
            param = value;

            const match = key && key.match(reExtend);

            if (match) {

                const targetSelector = match[1];
                const prefix = targetSelector[0] === '.' ? '.' : '';
                const name = prefix ? targetSelector.substring(1) : targetSelector;
                const re = new RegExp(/prefix(^|\b)search(?!-)($|\b)/.source.replace('prefix', prefix).replace('search', name));
                const wildcard = param[0] === 'all';

                delete node[key];

                iterate(style, (node, key, parent) => {
                    if (isPlainObject(node) && key) {

                        if (key.includes(targetSelector)) {

                            const selectors = key.split(', ');
                            if (wildcard) {

                                selectors.forEach(selector => {

                                    const newSelector = selector.replace(re, (reg) => {
                                        return selectorToAdd;
                                    });

                                    if (newSelector !== selector) {
                                        selectors.push(newSelector);
                                    }

                                });

                            } else if (selectors.includes(targetSelector)) {
                                selectors.push(selectorToAdd);
                            }

                            const newKey = selectors.join(', ');
                            if (newKey !== key) {
                                replaceKey(parent.node, key, newKey);
                            }
                        }

                    }
                });
            }
        });

        return node;
    }

    onProcessSheet(style) {
        iterate(style, (node, key, parent) => {
            this.onRuleO(node, key, parent, style);
        });

        return style;
    }

}
