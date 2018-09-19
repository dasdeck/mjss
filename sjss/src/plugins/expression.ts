import {forEach, isPlainObject, omit} from 'lodash';
import {UnitNumber} from 'mjss-css-utils';
import {functions} from 'less2mjss';

export default class Expressions {
    constructor(options = {context: {}}) {

        this.options = options;
    }

    onProcessSheet(rule) {

        this.env = rule['@env'];
        this.prepareContext();
        rule = omit(rule, '@env');

        return this.evaluateObject(rule);

    }

    evaluateObject(obj, name = null, parent = null) {

        const result = {};

        forEach(obj, (val, name) => {

            if (isExpression(name)) {

                const res = this.eval(name);

                const rules = isPlainObject(res) ? res : (res && val || {});

                forEach(this.evaluateObject(rules, name, obj), (val, key) => {

                    if (parent && isPlainObject(val)) {

                        key = key.split(',').map(selector => selector.includes('&') ? selector.trim() : '& ' + selector.trim()).join(', ');

                    }
                    result[key] = val;

                });

            } else {

                if (isTemplate(name)) {
                    name = this.eval(name);
                }

                if (isEvaluable(val)) {
                    val = this.eval(val);
                }

                if (isPlainObject(val)) {
                    val = this.evaluateObject(val, name, obj);
                }

                result[name] = val;
            }
        });

        return result;

    }

    addEnv(context) {

        forEach(this.env, (val, key) => {

            if (key in context) {

                console.warn({key}, 'already defined');

            } else {

                const expression = isEvaluable(val);

                if (expression) {
                    try {
                        const get = createExpression(val, context);
                        Object.defineProperty(context, key, {get});
                    } catch (e) {
                        console.error(e);
                    }
                } else {
                    const floatVal = parseFloat(val);

                    const hasUnits = floatVal != val; // eslint-disable-line
                    if (hasUnits && floatVal === floatVal) {
                        val = new UnitNumber(val);
                    }

                    context[key] = val;
                }

            }

        });

        return context;

    }

    prepareContext() {

        const plugin = this;
        this.context = this.addEnv(bindFunctions({

            ...functions,
            call(name, ...args) {

                let result;

                const rawMixin = this[name];

                if (isPlainObject(rawMixin)) {

                    const props = args[0];
                    const arg = this.arg;

                    if (props) {

                        this.arg = function (key) {
                            return props[key];
                        };

                    }

                    result = plugin.evaluateObject(rawMixin);
                    this.arg = arg;

                } else {

                    result = rawMixin(...args);

                }

                return result;
            },
            ...this.options.context

        }));
    }

    eval(exp) {
        try {
            return createExpression(exp, this.context)();
        } catch (e) {
            throw e;
        }
    }
}

function bindFunctions(context) {

    forEach(context, (val, key) => {
        if (val.bind) {
            context[key] = val.bind(context);
        }
    });
    return context;
}

const expressionCache = {};

function createExpression(rawString, context = {}) {

    let cached = expressionCache[rawString];
    if (!cached) {

        const exp = isExpression(rawString) ? rawString.substr(1, rawString.length - 2) : rawString;
        const script = `with (this) { return ${exp}; }`;
        cached = expressionCache[rawString] = new Function(script);
    } else {
        // console.log('expCache');
    }

    return cached.bind(context);

}

function isEvaluable(str) {
    return isExpression(str) || isTemplate(str);
}

function isExpression(str) {
    return str && str[0] === '/';
}

function isTemplate(str) {
    return str && str[0] === '`';
}

