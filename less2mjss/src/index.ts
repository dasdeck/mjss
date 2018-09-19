import * as less from 'less';
import {isArray, mapKeys, forEach, some, size, merge, map, assign} from 'lodash';

import lessFunctions from './lessFunctions';
import {staticFunctions, customMixinFunctions, operatorMap} from './lib';
import {nativeFunctions} from 'mjss-css-utils';


export function patchAST(rootNode, options) {

    let dynID = 1;
    let instanceId = 1;

    patchNode(rootNode);

    function wrapExpression(exp) {
        return exp[0] === '`' && exp[exp.length - 1] === '`' ? exp : `/${exp}/`;
    }
    function wrapTemplate(exp) {
        return exp[0] === '`' && exp[exp.length - 1] === '`' ? exp : `\`${exp}\``;
    }

    function concatArgs(args, node, context) {

        const dynamic = context.dynamic || node.hasVars();

        const res = args.map(arg => {

            const dynamic = arg.isDynamic() || arg.hasVars() || context.fullDynamic;

            const sContext = {...context, dynamic};

            if (dynamic && args.length > 1) {
                return '${' + arg.render(sContext) + '}';
            } else {
                return arg.render(sContext);
            }
        }).join(' ');

        return !dynamic || args.length === 1 ? res : `\`${res}\``;

    }

    // adds render functions to the less ast to stringify recursively
    function patchNode(node) {

        if (!node) {
            return;
        }

        if (node instanceof less.tree.Value) {

            node.render = function(context) {

                const sContext = {...context};

                const args = node.value.map(v => v.render(sContext));

                let res;

                if (parent.variable) {
                    res = args.join(' ');
                } else if (context.dynamic) {

                    // res = `${node.value.length === 1 ? args[0] : `$['_concat']('${args.join("', '")}')`}`;
                    res = concatArgs(node.value, node, sContext);

                } else {
                    res = args.join(' ');
                }

                return res;

            };

        } else if (node instanceof less.tree.Expression) {

            node.render = function(context) {

                const sContext = {...context, parent: this};

                if (context.dynamic) {

                    return concatArgs(node.value, node, context);

                } else {

                    const args = node.value.map(v => v.render(sContext));
                    return args.join(' ');

                }
            };

        } else if (node instanceof less.tree.Call) {

            node.render = function(context) {

                const nativeFunction = this.native = nativeFunctions.includes(this.name);
                const staticFunction = staticFunctions[this.name];
                const dynamicFunction = lessFunctions[this.name];

                const native = !!nativeFunction;

                const sContext = {...context, parent: this, nativeFunction, dynamicFunction, staticFunction};

                if (native) {

                    if (context.dynamic) {

                        return `nf('${this.name}', ${this.args.map(v => {
                            const res = `${v.render(sContext)}`;
                            return res;
                        }).join(', ')})`;

                    } else {

                        return `${this.name}(${this.args.map(v => `${v.render(sContext)}`).join(', ')})`;

                    }

                } else {

                    const args = this.args.map(v => v.render(sContext));

                    if (staticFunction) {
                        return context.dynamic ? `'${staticFunction(...args)}'` : staticFunction(...args);
                    } else {
                        return `call('${node.name}', ${args.join(', ')})`;
                    }

                }
            };

        } else if (node instanceof less.tree.Dimension) {

            node.render = function(context) {

                const value = this.unit.backupUnit === '%' && context.dynamic && context.fullDynamic ? this.value : this.value;
                const unit = this.unit.backupUnit || '';

                if (context.native) {

                    if (context.dynamic) {
                        return `'${value}${unit}'`;
                    } else {
                        return `${value}${unit}`;
                    }

                } else {

                    return (context.dynamic || context.fullDynamic) && unit && !context.pureStatic ? `'${value}${unit}'` : `${value}${unit}`;

                }

            };

        } else if (node instanceof less.tree.Variable) {

            node.getUnit = function(context) {

                const variable = context.variablesRaw[this.name];
                const unit = variable && variable.getUnits(true);
                return unit;

            };

            node.render = function(context) {

                const dynamic = context.dynamic;// && !nativeParent || context.rule.isDynamic();
                const res = this.name.replace(/@(.*)/, (res, rep) => dynamic ? `env('${rep}')` : `var(--${rep})`);
                return res;

            };

        } else if (node instanceof less.tree.Operation) {

            node.render = function(context) {

                const parent = context.parent;
                const sContext = {...context, parent: this};

                if (!context.hasVars) {
                    const res = {add(string){this.data += string}, data: ''};
                    this.eval({isMathOn: () => true}).genCSS({}, res);
                    return res.data;
                }

                const func = operatorMap[this.op.trim()];
                let exp;
                if (!func) {
                    throw 'invalid operator: ' + this.op;
                } else if (options.expandExpressions) {
                    exp = `${this.operands[0].render(sContext)} ${this.op} ${this.operands[1].render(sContext)}`;
                } else {
                    exp = `call('${func}', ${this.operands[0].render(sContext)}, ${this.operands[1].render(sContext)})`;
                }

                if (parent.name === 'calc') {
                    return `'${exp}'`;
                } else if (options.expandExpressions) {
                    return `calc(${exp})`;
                } else {
                    return exp;
                }

            };

        } else if (node instanceof less.tree.Negative) {

            node.render = function(context) {

                const sContext = {...context, parent: this};
                const value = this.value.render(sContext);

                if (options.expandExpressions) {

                    const unit = this.getUnits() || '';
                    return `calc(0${unit} - ${value})`;

                } else if (context.dynamic) {

                    return `sub(0, ${value})`;

                } else {

                    return `-${value}`;

                }

            };

        } else if (node instanceof less.tree.Color) {

            node.render = function(context) {

                const parent = context.parent;
                if (parent && parent.native && !context.dynamic) {
                    return this.value;
                } else {
                    return context.customFunction || context.dynamic ? `'${this.value}'` : this.value;
                }

            };

        } else if (node instanceof less.tree.Ruleset) {

            node.render = function(context) {

                const parent = context.parent;
                const sContext = {...context, parent: this};

                let result;
                const lastSet = context.set;
                sContext.set = node;
                sContext.isNested = parent && !parent.root;
                let name = node.root ? ':root' : node.selectors.map(s => s.render(sContext)).join(', ');
                const insidePureMixin = parent && parent instanceof less.tree.mixin.Definition;

                if (sContext.isNested && !insidePureMixin && name[0] !== '&') {

                    name = '& ' + name;

                }

                const funcName = name.substr(1);
                const specialMixin = customMixinFunctions[funcName];

                sContext.dynamic = !!specialMixin;

                const originalRules = node.rules.reduce((prev, cur) => {
                    if (cur.render) {

                        if (node.root) { // use double instances

                            const newEl = cur.render(sContext);
                            if (size(newEl)) {

                                const name = Object.keys(newEl)[0];
                                const el = newEl[name];
                                const targetName = name;// + `#${context.component || 'global'}#`;

                                if (prev[targetName]) {

                                    if (el.pure) {

                                        merge(prev, newEl);

                                    } else {
                                        const quote = name[0] === '`' ? '`' : '';
                                        const cleanName = quote ? name.substr(1, name.length - 2) : name;
                                        const newName = `${quote}${cleanName} /* id:${instanceId++} */${quote}`;

                                        prev[newName] = el;

                                    }
                                } else {
                                    prev[targetName] = el;
                                }

                            }
                        } else {
                            prev = {...prev, ...cur.render(sContext)};
                        }
                    }
                    return prev;
                }, {});

                if (!options.skipEmptyRules || Object.keys(originalRules).length) {

                    const pure = (specialMixin && funcName) || node instanceof less.tree.mixin.Definition;
                    const generatedRules = {};

                    const exts = this.selectors && this.selectors.map(s => s.extendList || []).filter(el => el.length) || [];

                    if (exts.length) {
                        exts[0].forEach(ext => {
                            const name = `@extend ${ext.selector.render(sContext)}`;
                            generatedRules[name] = ext.option ? {[ext.option]: true} : {};
                        });
                    }
                    const condition = node.condition || node.selectors && node.selectors[0] && node.selectors[0].condition;

                    const rules = {...generatedRules, ...originalRules};

                    const finalRules = condition ? {[wrapExpression(condition.render(sContext))]: rules} : rules;

                    // if (condition) {

                    //     generatedRules.condition = );

                    // }
                    context.mixinsRaw[name] = node;


                    // if (!specialMixin) {

                    // }
                    if (pure) {
                        context.pureMixins[name.substr(1)] = context.pureMixins[name.substr(1)] || {};
                        merge(context.pureMixins[name.substr(1)], finalRules);
                    } else {
                        result = {
                            [name]: finalRules
                        };
                    }

                } else {

                    result = {};

                }

                context.set = lastSet;
                return result;
            };

        } else if (node instanceof less.tree.Condition) {

            node.render = function(context) {

                // const parent = context.parent;
                const sContext = {...context, parent: this};

                let op;
                switch (this.op) {
                    case '=':
                        op = '===';
                        break;
                    case 'or':
                        op = '||';
                        break;
                    case 'and':
                        op = '&&';
                        break;
                    default:
                        throw 'unknown operator:' + this.op;

                }

                sContext.dynamic = true;
                sContext.condition = true;

                let res = `${this.lvalue.render(sContext)} ${op} ${this.rvalue.render(sContext)}`;
                if (this.negate) {
                    res = `!(${res})`;
                }

                if (context.condition) {
                    res = `(${res})`;
                }

                return res;
            };

        } else if (node instanceof less.tree.Rule) {

            node.render = function(context) {

                const parent = context.parent;
                const sContext = {...context, parent: this};

                const asString = context.asString;

                sContext.hasVars = this.value.hasVars();
                sContext.dynamic = sContext.hasVars && !options.expandExpressions || this.hasCustomFunction();

                sContext.pureStatic = !sContext.dynamic;

                sContext.rule = node;

                const nameContext = {...sContext};

                const isPlainVariableRuleName = typeof node.name === 'string' && node.name[0] === '@';
                nameContext.dynamic = nameContext.hasVars = node.name.hasVars && node.name.hasVars() || isPlainVariableRuleName;


                nameContext.pureStatic = !nameContext.hasVars;

                const isRootVar = (!parent || parent.root) && node.variable;
                const extractDynamic = sContext.dynamic && options.extractDynamicRules;
                sContext.fullDynamic = node.variable || node.hasCustomFunction();

                const name = isPlainVariableRuleName && !isRootVar ? node.name.replace(/@(.*)/, (all, name) => `env('${name}')`) : (isArray(node.name) ? node.name.map(name => name.render(nameContext)).join(nameContext.dynamic ? '+' : ' ') : node.name);

                if (isRootVar) {

                    if (name === '@component') {

                        context.component = node.value.render(sContext);

                    } else {

                        context.variablesRaw[name] = node;
                        const value = node.value.render(sContext);

                        const finalName = name.substr(1);

                        let res;
                        if (node.important) {

                            res = sContext.pureStatic ? `${value}${node.important}` : `\`\${${value}}${node.important}\``;

                        } else {

                            res = value;

                        }

                        context.variables[`${finalName}`] = sContext.pureStatic ? res : wrapExpression(res);

                    }

                } else if (extractDynamic) {

                    sContext.dynamic = true;

                    context.variablesRaw[name] = node;

                    const value = node.value.render(sContext);
                    const hash = dynID++;

                    context.variables[`dyn-${hash}`] = value;

                    return {[name]: `var(--dyn-${hash})`};

                } else if (asString) {
                    // debugger
                    return this.hasVars() ? `${name}: \${${node.value.render(sContext)}}` : `${name}: ${node.value.render(sContext)}`;

                } else {

                    // debugger
                    const finalName = nameContext.dynamic || isPlainVariableRuleName ? '`${' + name + '}`' : name;

                    // const finalName = name.includes('@{') ? `\`${name.replace(/@{(.*?)}/g, (line, name) => `\${env('${name}')}`)}\`` : name;

                    const important = (node.important && (sContext.dynamic || sContext.fullDynamic) ? ` ${node.important}` : node.important) || '';
                    const value = node.value.render(sContext);
                    let res = important ? (sContext.pureStatic ? `${value}${node.important}` : `\`\${${value}}${important}\``) : value;

                    // res = wrapInQuotes && !['"', "'"].includes(res[0]) ? `\`'\${${res}}'\`` : res;
                    res = sContext.pureStatic ? res : wrapExpression(res);

                    return {
                        [finalName]: res
                    };

                }

            };
        } else if (node instanceof less.tree.Anonymous) {

            node.render = function() {
                return node.value;
            };

        } else if (node instanceof less.tree.mixin.Call) {

            node.render = function(context) {

                const sContext = {...context, parent: this};

                context.set._mixins = context.set._mixins || [];
                const mixin = context.set._mixins;
                const name = node.selector.render(sContext).substr(1);

                if (customMixinFunctions[name]) {

                    const func = customMixinFunctions[name];
                    sContext.dynamic = true;
                    sContext.fullDynamic = true;
                    sContext.pureStatic = false;
                    sContext.customFunction = true;
                    const val = `/${func.name || name}(${node.arguments.map(v => v.value.render(sContext)).join(', ')})/`;
                    mixin.push(val);
                }

                const def = context.mixinsRaw[`.${name}`];
                const params = {};
                // debugger
                if (def && def.params.length) {

                    sContext.dynamic = true;
                    sContext.fullDynamic = true;
                    sContext.pureStatic = false;
                    sContext.customFunction = true;

                    def.params.forEach((val, index) => {
                        if (node.arguments[index]) {
                            params[val.name.substr(1)] = node.arguments[index].value.render(sContext);
                        }
                    });

                    const escape = (key) => key.includes('-') || true ? `'${key}'` : key;


                    const argString = map(params, (val, key) => `${escape(key)}: ${val}`).join(', ');
                    // const args = JSON.stringify().replace(/(:)"|"(,)/g, (res, char) => char).replace(/({|,)(.*?):/g, (res, key,) => `'${key}'`);
                    return {[`/call('${name}', {${argString}})/`]: {}};

                } else {
                    return {[`/call('${name}')/`]: {}};
                }

            };

        } else if (node instanceof less.tree.Selector) {

            node.render = function(context) {
                const sContext = {...context, parent: this};
                // debugger
                return this.elements.map((v, i) => v.render(sContext, i)).join('');

            };

        } else if (node instanceof less.tree.Keyword) {

            node.render = function(context) {

                return !context.pureStatic && (context.dynamic || context.fullDynamic) ? `'${node.value}'` : node.value;

            };

        } else if (node instanceof less.tree.Comment) {

            node.render = function() {

                return {};

            };

        } else if (node instanceof less.tree.Quoted) {

            node.render = function(context) {

                let value;
                const re = /@{(.*?)}/g;
                if (node.value && node.value.match(re)) {

                    const pureNative = !context.dynamic && (node.value.match(/\bcalc\b\(/) || options.expandExpressions);

                    value = node.value.replace(re, (part, name) => {
                        return !pureNative ? `\${env('${name}')}` : `var(--${name})`;
                    });

                    return pureNative ? value : `\`${value}\``;

                } else {
                    value = node.value;
                }

                if (context.condition && !value) {
                    value = "''";
                }

                if (node.escaped) {
                    return value;
                } else {

                    return `${node.quote}${value}${node.quote}`;
                }

            };

        } else if (node instanceof less.tree.URL) {

            node.render = function(context) {
                const sContext = {...context, parent: this};
                return context.pureStatic ? `url(${node.value.render(sContext)})` : `nf('url', ${node.value.render(sContext)})`;
            };

        } else if (node instanceof less.tree.Import) {

            node.render = function(context) {
                const sContext = {...context, parent: this};
                let key;
                if (context.pureStatic) {
                    key = `@import ${this.path.render(sContext)}`;
                } else {
                    key = wrapTemplate(`@import \${${this.path.render(sContext)}}`);
                }

                return {[key]: {}};
            };

        } else if (node instanceof less.tree.Element) {

            node.render = function(context, index) {
                let res = '';
                if (this.value.render) {
                    res += this.value.render();
                } else {
                    res += this.value;
                }
                const sContext = {...context, index};
                return (this.combinator.render(sContext) || '') + res;
            };

        } else if (node instanceof less.tree.Attribute) {

            node.render = function(context) {
                const sContext = {...context, parent: this};

                let res = '[';
                if (this.key) {
                    res += this.key;
                }
                if (this.op) {
                    res += this.op;
                }
                if (this.value) {
                    res += this.value.render ? this.value.render(sContext) : this.value;
                }
                return res + ']';
            };

        } else if (node instanceof less.tree.Combinator) {

            node.render = function(context) {
                // const space = (context.index ? ' ' : '');
                if (context.index) {
                    return this.value.trim() === '' ? this.value : ` ${this.value} `;
                } else {
                    return this.value.trim();
                }
            };

        } else if (node instanceof less.tree.Paren) {

            node.render = function(context) {

                const sContext = {...context, [node.type]: true};
                return `(${this.value.render(sContext)})`;

            };

        } else if (node instanceof less.tree.Media) {

            node.render = function(context) {

                const sContext = {...context, [node.type]: true};

                node.root = node.rules[0].rules.root = 'media';

                // sContext.dynamic = false;

                const content = node.rules[0].rules.reduce((res, set) => {

                    return assign(res, set.render(sContext));

                }, {});

                sContext.asString = true;
                let key = `@media ${node.features.render(sContext)}`;

                if (node.features.hasVars()) {
                    key = wrapTemplate(key);
                }
                return {
                    [key]: content
                };

            };

        } else if (node instanceof less.tree.Directive) {

            node.render = function(context) {

                const sContext = {...context, [node.type]: true};

                node.root = node.rules[0].rules.root = node.name;

                const content = mapKeys(node.rules[0].render(sContext)['&'], (val, key) => {
                    return key.replace('& ', '');
                });

                const features = node.features && node.features.render(sContext) || node.value && node.value.render(sContext) || '';

                // make exception for page (not a directive)

                return {
                    [`${node.name} ${features}`.trim()]: content
                };
            };

        } else if (Array.isArray(node)) {
			//
        } else {
            // console.log('undefined', node);
        }

        forEach(node, (val, key) => {
            if (typeof val === 'object') {
                patchNode(val);
            }
        });

        function iterate(node, func) {
            let res;
            some(node, (val, key) => {
                if (val && typeof val === 'object') {
                    return res = val[func] && val[func]() || iterate(val);
                }
            });
            return res;
        }

        node.findChild = function(test) {

            let res = test(node);
            if (!res) {
                some(this, (val, key) => {
                    if (val && typeof val === 'object') {
                        return res = val.findChild(test);
                    }
                });
            }
            return res;
        };

        node.getUnits = function(recursive) {
            if (this.getUnit && !recursive) {
                return this.getUnit();
            } else {
                return this.unit && this.unit.backupUnit || iterate(this, 'getUnits');
            }
        };

        node.hasVars = function() {
            return this.findChild(node => node instanceof less.tree.Variable || (node instanceof less.tree.Quoted && node.value.match(/@.+/g)));
        };

        node.hasCustomFunction = function() {
            return this.findChild(node =>
                node instanceof less.tree.Call && !nativeFunctions.includes(node.name) && !staticFunctions[node.name] ||
                node instanceof less.tree.mixin.Call && customMixinFunctions[node.name]);
        };

        node.isDynamic = function() {
            return this.findChild(node => node.dynamic && node.dynamic());
        };

    }

}

export function less2mjss(lessString, options = {skipEmptyRules: true, expandExpressions: false, extractDynamicRules: false}) {

    let result;

    less.parse(lessString, options.less, (err, root) => {
        if (err) {
            throw err.message;
        } else {
            patchAST(root, options);

            const context = {variables: {}, pureMixins: {}, variablesRaw: {}, component: null, components: {}, mixinsRaw: {}};


            result = {
                ...root.render(context)[':root']
            };

            if (size(context.variables)) {
                result['@env'] = context.variables;
            }

            if(size(context.pureMixins)) {
                const env = result['@env'] = result['@env'] || {};
                forEach(context.pureMixins, (mixin, name) => {
                    if (env[name]) {
                        throw 'mixin ' + name + ' overshadows variable declaration';
                    }
                    env[name] = mixin;
                })
            }
        }

    });

    return result;

}

export default less2mjss;