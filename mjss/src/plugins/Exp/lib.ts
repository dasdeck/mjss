export function makeExpressive(rule, key, context) {
    const value = rule[key];
    if (isEvaluable(value)) {
        rule[`_exp_${key}`] = value;
        Object.defineProperty(rule, key, {get: createExpression(value, context)});
    }
}

export function isEvaluable(str) {
    return isExpression(str) || isTemplate(str);
}

export function isExpression(str) {
    return str && str[0] === '/';
}

export function isTemplate(str) {
    return str && str[0] === '`';
}

export function createExpression(str, context = {}) {
    const expr = isExpression(str) ? str.substr(1, str.length - 2) : str;
    return (new Function(`with (this) { return ${expr}; }`)).bind(context);
}