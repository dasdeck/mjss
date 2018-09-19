import {forEach, isPlainObject, forEachRight, isArray} from 'lodash';

export function iterate(node, action, key = null, parent = null) {

    isPlainObject(node) && forEach(node, (child, ckey) => {
        iterate(child, action, ckey, {node, key, parent});
    });

    action(node, key, parent);

}

export function iterateInverse(node, action, key = null, parent = null) {

    isPlainObject(node) && forEachRight(node, (child, ckey) => {
        iterateInverse(child, action, ckey, {node, key, parent});
    });

    action(node, key, parent);

}

export function iterateClone(node, action, key = null, parent = null) {

    if (isPlainObject(node)) {

        const res = {};

        node = action(node, key, parent);

        forEach(node, (child, ckey) => {
            const newNode = iterateClone(child, action, ckey, {node: res, parent, key});
            if (newNode) {
                res[ckey] = newNode;
            }
        });

        return res;

    } else {
        return action(node, key, parent);
    }

}



export function insertValuesAfter(obj, search, values) {
    const res = {};
    for (const key in obj) {

        const val = obj[key];

        res[key] = val;

        if (key === search) {
            if (isArray(values)) {
                values.forEach(({key, value}) => {
                    res[key] = value;
                });
            } else {
                for (const k in values) {
                    res[k] = values[k];
                }
            }
        }

        delete obj[key];

    }

    Object.assign(obj, res);
}

export function replaceKey(obj, oldKey, newKey) {
    const res = {};
    for (const key in obj) {

        const val = obj[key];

        if (key === oldKey) {
            res[newKey] = val;
        } else {
            res[key] = val;
        }

        delete obj[key];

    }

    Object.assign(obj, res);
}
