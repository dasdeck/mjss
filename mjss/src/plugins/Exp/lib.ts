export function makeExpressive(rule, key, context, value = rule[key], backup = true) {
    if (isEvaluable(value)) {
        Object.defineProperty(rule, key, {get: createExpression(value, context)});
        if (backup) {
            rule[`_exp_${key}`] = value;
        }
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

export function toVarName(expression) {
    return `--exp${hash(expression)}`;
}
export function hash(string) {
    let hash = 0, chr;
    if (string.length === 0) return hash;
    for (let i = 0; i < string.length; i++) {
        chr = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}