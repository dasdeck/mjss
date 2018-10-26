import { isObject, isFunction } from "lodash";

/**
 * merges two objects, prevents keys from being overwritten by iterating an extra id
 * @param a
 * @param b
 * @param id
 */
export function iteratedMerge(a, b, id:any = true) {

    for (const key in b) {

        if (isObject(a[key]) && isObject(b[key])) {

            if (id === true || isFunction(id) && id(key)) {

                let instanceId = 2;
                let targetKey = key;
                const quote = targetKey[0] === '`' ? '`' : '';
                const cleanName = quote ? targetKey.substr(1, targetKey.length - 2) : targetKey;

                while (targetKey in a) {
                    targetKey = `${quote}${cleanName} /* id:${instanceId++} */${quote}`;
                }

                a[targetKey] = b[key];

            } else {

                iteratedMerge(a[key], b[key], id);

            }


        } else {

            a[key] = b[key];

        }
    }

    return a;

}

