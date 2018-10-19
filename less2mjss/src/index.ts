import * as less from 'less';
import {isArray, mapKeys, forEach, some, size, map, assign} from 'lodash';

import lessFunctions from './lessFunctions';
import {staticFunctions as sf, customMixinFunctions, operatorMap} from './lib';
import {nativeFunctions} from 'mjss-css-utils';
import {util} from 'mjss';

const iteratedMerge = util.iteratedMerge;

export function less2mjss(lessString, options:any = {less: {}, skipEmptyRules: false, expandExpressions: false, extractDynamicRules: false, staticFunctions: {}}) {

    const staticFunctions = {...sf, ...options.staticFunctions};

    function patchAST(rootNode, options) {

        let dynID = 1;

        patchNode(rootNode);

        function wrapExpression(exp) {
            return exp[0] === '`' && exp[exp.length - 1] === '`' ? exp : `/${exp}/`;
        }
        function wrapTemplate(exp) {
            return exp[0] === '`' && exp[exp.length - 1] === '`' ? exp : `\`${exp}\``;
        }

        function concatArgs(args, node, context, joinWith = ' ') {

            const dynamic = context.dynamic || node.hasVars();

            const res = args.map(arg => {

                const dynamic = arg.isDynamic() || arg.hasVars() || context.fullDynamic;

                const sContext = {...context, parent: this, dynamic};

                if (dynamic && args.length > 1) {
                    return '${' + arg.render(sContext) + '}';
                } else {
                    return arg.render(sContext);
                }
            }).join(joinWith);

            return !dynamic || args.length === 1 ? res : `\`${res}\``;

        }

        // adds render functions to the less ast to stringify recursively
        function patchNode(node) {

            if (!node) {
                return;
            }

            if (node instanceof less.tree.Value) {

                node.render = function(context) {

                    const sContext = {...context, parent: this};

                    const args = node.value.map(v => v.render(sContext));

                    let res;

                    if (context.variable) {
                        res = args.join(' ');
                    } else if (context.dynamic) {

                        res = concatArgs(node.value, node, sContext, ', ');

                    } else {
                        res = args.join(', ');
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

                    const nativeFunction = this.native = ~nativeFunctions.indexOf(this.name);
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
                            const func = staticFunction.bind(staticFunctions);
                            return context.dynamic ? `'${func(...args)}'` : func(...args);
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

                    const dynamic = context.dynamic;
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
                        if(res.data !== 'NaN') {
                            return res.data;
                        } else {
                            res.data = '';
                            this.eval({isMathOn: () => false}).genCSS({}, res);
                            return res.data;
                        }
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

                    if (parent && parent.name === 'calc') {
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

                        return `call('sub', 0, ${value})`;

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

            } else if (node instanceof less.tree.Extend) {

                node.render = function(context) {
                    const sContext = {...context, parent: this};
                    const key = `@extend ${this.selector.render(sContext)}`;
                    return {[key]: this.option ? {[this.option]: true} : {}};
                }

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

                            const newEl = cur.render(sContext);
                            if (size(newEl)) {

                                const name = Object.keys(newEl)[0];
                                const el = newEl[name];
                                const targetName = name;

                                if (prev[targetName]) {

                                    iteratedMerge(prev, newEl);

                                } else {
                                    prev[targetName] = el;
                                }

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

                        context.mixinsRaw[name] = node;

                        if(pure) {
                            name = name.substr(1);
                        }

                        if (pure && specialMixin) {
                            return {};
                        }

                        if (context.addToComponent({[name]: finalRules}, pure)) {

                            return {};
                        }


                        if (pure) {
                            context.pureMixins[name] = context.pureMixins[name] || {};
                            iteratedMerge(context.pureMixins[name], finalRules);
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

                    const isRoot = !parent || parent.root;
                    const isRootVar = isRoot && node.variable;
                    const extractDynamic = sContext.dynamic && options.extractDynamicRules;
                    sContext.fullDynamic = node.variable || node.hasCustomFunction();

                    const name = isPlainVariableRuleName && !isRootVar ? node.name.replace(/@(.*)/, (all, name) => `env('${name}')`) : (isArray(node.name) ? node.name.map(name => name.render(nameContext)).join(nameContext.dynamic ? '+' : ' ') : node.name);

                    if (isRootVar) {

                        if (name === '@component') {

                            const componentName = node.value.render(sContext);
                            context.component = `/group('${componentName}')/`;
                            context.file = componentName.substr(1, componentName.length - 2);

                        } else {

                            context.variablesRaw[name] = node;
                            let value = node.value.render(sContext);

                            if (value.includes('.svg') && staticFunctions.inline) {
                                value = staticFunctions.inline(value, 'image/svg+xml;charset=UTF-8',  options.inline);
                            }

                            const finalName = name.substr(1);

                            let res;
                            if (node.important) {

                                res = sContext.pureStatic ? `${value}${node.important}` : `\`\${${value}}${node.important}\``;

                            } else {

                                res = value;

                            }

                            const asNumber = parseFloat(res);
                            if (asNumber == res) {
                                res = asNumber;
                            }
                            const finalValue = sContext.pureStatic ? res : wrapExpression(res);

                            if (!context.addToComponent({[finalName]:finalValue}, true)) {
                                context.variables[finalName] = finalValue;
                            }

                        }

                    } else if (extractDynamic) {

                        sContext.dynamic = true;

                        context.variablesRaw[name] = node;

                        const value = node.value.render(sContext);
                        const hash = dynID++;

                        context.variables[`dyn-${hash}`] = value;

                        return {[name]: `var(--dyn-${hash})`};

                    } else if (asString) {
                        return this.hasVars() ? `${name}: \${${node.value.render(sContext)}}` : `${name}: ${node.value.render(sContext)}`;

                    } else {

                        const finalName = nameContext.dynamic || isPlainVariableRuleName ? '`${' + name + '}`' : name;


                        const important = (node.important && (sContext.dynamic || sContext.fullDynamic) ? ` ${node.important}` : node.important) || '';
                        const value = node.value.render(sContext);
                        let res = important ? (sContext.pureStatic ? `${value}${node.important}` : `\`\${${value}}${important}\``) : value;

                        res = sContext.pureStatic ? res : wrapExpression(res);

                        if (!context.addToComponent({[finalName]:res})) {
                            return {
                                [finalName]: res
                            };
                        }

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

                        sContext.dynamic = true;
                        sContext.fullDynamic = true;
                        sContext.pureStatic = false;
                        sContext.customFunction = true;
                        const args = node.arguments.map(v => v.value.render(sContext));
                        if (staticFunctions[name]) {

                            return staticFunctions[name](...args);

                        } else {
                            const func = customMixinFunctions[name];

                            const val = `/${func.name || name}(${args.join(', ')})/`;
                            mixin.push(val);
                        }

                    }

                    const def = context.mixinsRaw[`.${name}`];
                    const params = {};

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

                        const escape = (key) => ~key.indexOf('-') || true ? `'${key}'` : key;


                        const argString = map(params, (val, key) => `${escape(key)}: ${val}`).join(', ');

                        return {[`/call('${name}', {${argString}})/`]: {}};

                    } else {
                        const res = {[`/call('${name}')/`]: {}};
                        if (context.addToComponent(res)) {
                            return {};
                        } else {
                            return res;
                        }
                    }

                };

            } else if (node instanceof less.tree.Selector) {

                node.render = function(context) {
                    const sContext = {...context, parent: this};
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

                        const env = context.unquote ? 'envu' : 'env';
                         value = node.value.replace(re, (part, name) => {
                            return !pureNative ? `\${${env}('${name}')}` : `var(--${name})`;
                        });

                        let quote = node.escaped || context.noQuotes ? '' : node.quote;

                        return pureNative ? value : `\`${quote}${value}${quote}\``;

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
                    const sContext = {...context, parent: this, noQuotes: true }

                    const val = node.value.render(sContext);

                    return context.pureStatic ? `url(${node.value.render(sContext)})` : `nf('url', ${val})`;
                };

            } else if (node instanceof less.tree.Import) {

                node.render = function(context) {
                    const sContext = {...context, parent: this, unquote: true};
                    let key;
                    if (context.pureStatic) {
                        key = this.path.render(sContext);
                    } else {
                        key = this.path.render(sContext);
                    }

                    return {[`/call('import', ${key})/`]: {}}
                };

            } else if (node instanceof less.tree.Element) {

                node.render = function(context, index) {
                    let res = '';
                    if (this.value.render) {
                        res += this.value.render();
                    } else {
                        res += this.value;
                    }
                    const sContext = {...context, index, parent: this};
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

                    if (context.index) {
                        return this.value.trim() === '' ? this.value : ` ${this.value} `;
                    } else {
                        return this.value.trim();
                    }
                };

            } else if (node instanceof less.tree.Paren) {

                node.render = function(context) {

                    const sContext = {...context, parent: this, [node.type]: true};
                    return `(${this.value.render(sContext)})`;

                };

            } else if (node instanceof less.tree.Media) {

                node.render = function(context) {

                    const sContext = {...context, parent: this, [node.type]: true};

                    node.root = node.rules[0].rules.root = 'media';

                    const content = node.rules[0].rules.reduce((res, set) => {

                        return assign(res, set.render(sContext));

                    }, {});

                    sContext.asString = true;
                    let key = `@media ${node.features.render(sContext)}`;

                    if (node.features.hasVars()) {
                        key = wrapTemplate(key);
                    }

                    if (context.addToComponent({[key]: content})) {
                        return {};
                    } else {
                        return {
                            [key]: content
                        };
                    }



                };

            } else if (node instanceof less.tree.Directive) {

                node.render = function(context) {

                    const sContext = {...context, parent: this, [node.type]: true};

                    node.root = node.rules[0].rules.root = node.name;

                    const content = mapKeys(node.rules[0].render(sContext)['&'], (val, key) => {
                        return key.replace('& ', '');
                    });

                    const features = node.features && node.features.render(sContext) || node.value && node.value.render(sContext) || '';

                    const res = {
                        [`${node.name} ${features}`.trim()]: content
                    };
                    // make exception for page (not a directive)
                    if (context.addToComponent(res)) {
                        return {};
                    } else {

                        return res;
                    }
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
                        return res = val[func] && val[func]() || iterate(val, func);
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
                    node instanceof less.tree.Call && !~nativeFunctions.indexOf(node.name) && !staticFunctions[node.name] ||
                    node instanceof less.tree.mixin.Call && customMixinFunctions[node.name]);
            };

            node.isDynamic = function() {
                return this.findChild(node => node.dynamic && node.dynamic());
            };

        }

    }

    let result;

    less.parse(lessString,{...options.less, syncImport: true}, (err, root) => {
        if (err) {
            throw err.message;
        } else {
            patchAST(root, options);

            const context = {
                imports: {},
                variables: {},
                pureMixins: {},
                variablesRaw: {},
                component: null,
                components: {},
                mixinsRaw: {},
                addToComponent(data, env) {
                    if(this.parent && this.parent.root === true && this.component) {
                        this.components[this.component] = this.components[this.component] || {};
                        if (env) {
                            this.components[this.component]['@env'] = this.components[this.component]['@env'] || {};
                            iteratedMerge(this.components[this.component]['@env'], data, false);
                        } else {

                            iteratedMerge(this.components[this.component], data);
                        }
                        return true;
                    }
                }
            };

            result = {
                ...root.render(context)[':root']
            };

            if (size(context.components)) {
                result = context.components;
            } else {
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
        }

    });

    return result;

}

export default less2mjss;