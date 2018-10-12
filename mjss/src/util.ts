import { isObject, isFunction, merge } from "lodash";

let instanceId = 1;

export function iteratedMerge(a, b, id:any = true) {

    for (const key in b) {

        if (isObject(a[key]) && isObject(b[key])) {

            let targetKey = key;

            if (id === true || isFunction(id) && id(key)) {

                const quote = targetKey[0] === '`' ? '`' : '';
                const cleanName = quote ? targetKey.substr(1, targetKey.length - 2) : targetKey;
                targetKey = `${quote}${cleanName} /* id:${instanceId++} */${quote}`;
                a[targetKey] = b[key];

            } else {

                iteratedMerge(a[key], b[key], id);

            }


        } else {

            a[key] = b[key];

        }
    }

}