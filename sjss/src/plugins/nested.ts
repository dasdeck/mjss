import {iterate, iterateInverse, insertValuesAfter} from './lib';
import {forEach} from 'lodash';

// const reNested = /\s*(&).*/;

export default class Nested {

    getPath(parent) {
        return 'sheet' + (parent.parent && `['${this.getPath(parent.parent)}']'` || '') + (parent.key && `['${parent.key}']` || '');
    }

    unNestSelector(node, key, parent, pkey = null) {

        if (key && key.includes('&')) {

            pkey = parent.key;

            const selectors = pkey.split(', ');

            const newKeys = [];
            selectors.forEach(selector => {
                const newKey = key.replace(/&/g, selector);
                newKeys.push(newKey);
            });

            this.unNestSelector(node, newKeys.join(', '), parent.parent, pkey);

            delete parent.node[key];

        } else if (pkey && !(key in parent.node)) { // selector is resolved and we are at it's final destination

            const path = this.getPath(parent) + `['${pkey}']`;
            this.insertion[path] = this.insertion[path] || {node: parent.node, key: pkey, data: []};
            this.insertion[path].data.push({key, value: node});

        } else {
            return node;
        }
    }

    onProcessSheet(sheet) {

        this.insertion = {};
        iterateInverse(sheet, (node, key, parent) => {

            if (key) {
                this.unNestSelector(node, key, parent);
            }

        });

        forEach(this.insertion, insertion => {
            insertValuesAfter(insertion.node, insertion.key, insertion.data.reverse());
        });

        return sheet;
    }

}

