
/* eslint-env jest */

import Exp from '../src/plugins/Exp';
import {toVarName} from '../src/plugins/Exp/lib';

export default {
    options: (test) => ({plugins: [new Exp(test.opts)]}),
    tests: {
        'template key name': {
            jss: {
                '`.class`': {
                    '`color`': 'black'
                }
            },
            css: '.class{color:black;}'
        },
        'template name with dynamic value': {
            jss: {
                '@env': {
                    'color': 'black'
                },
                '`.class`': {
                    '`color`': "/env('color')/"
                }
            },
            css: '.class{color:black;}'
        },
        'global mixin': {
            jss: {
                '@env': {
                    mixin: {
                        '.class': {
                            'color': 'black'
                        }
                    }
                },
                "/call('mixin')/": {}
            },
            css: '.class{color:black;}'
        },
        'local mixin': {
            jss: {
                '@env': {
                    mixin: {
                        'color': 'black'
                    }
                },
                '.class': {
                    "/call('mixin')/": {}
                }
            },
            css: '.class{color:black;}'
        },
        'conditional (true)': {
            jss: {
                '@env': {
                    var1: 1,
                    mixin: {
                        "/env('var1') === 1/": {
                            'color': 'black'
                        }
                    }
                },
                '.class': {
                    "/call('mixin')/": {}
                }
            },
            css: '.class{color:black;}'
        },
        'conditional (false)': {
            jss: {
                '@env': {
                    var1: 0,
                    mixin: {
                        "/env('var1') === 1/": {
                            'color': 'black'
                        }
                    }
                },
                '.class': {
                    'color': 'red',
                    "/call('mixin')/": {}
                }
            },
            css: '.class{color:red;}'
        },
        'dynamic values': {
            jss: {
                '@env': {
                    var1: '10px',
                },
                '.class': {
                    'width': "/env('var1')/"
                }
            },
            css: '.class{width:10px;}'
        },
        'mixin with params': {
            jss: {
                '@env': {
                    mixin: {
                        color: "/env('color')/"
                    },
                },
                '.class': {
                    "/call('mixin', {color: 'red'})/": {}
                }
            },
            css: '.class{color:red;}'
        },
        'test unique keys': {
            opts: {forceUniqueKeys: true},
            jss: {
                '@env': {
                    mixin: {
                        color: "/env('color')/"
                    },
                },
                '.class': {
                    "/call('mixin', {color: 'red'})/": {},
                    "/call('mixin', {color: 'blue'})/": {},
                    color: 'green'
                }
            },
            css: '.class{color:green;}'
        },
        'test double keys': {
            jss: {
                '@env': {
                    mixin: {
                        color: "/env('color')/"
                    },
                },
                '.class': {
                    "/call('mixin', {color: 'red'})/": {},
                    "/call('mixin', {color: 'blue'})/": {}
                }
            },
            css: '.class{color:red;color:blue;}'
        },
        'add custom context': {
            opts: {
                context: {
                    var1: '10px',
                    concat: (...args) => args.join('')
                }
            },
            jss: {
                '.class': {
                    'width': "/var1/",
                    "color": "/concat('r', 'e', 'd')/"
                }
            },
            css: '.class{width:10px;color:red;}'
        },
        'return mixin from function': {
            opts: {
                env: {
                    var1: '10px',
                    myMixin: () => ({color: 'red'})
                }
            },
            jss: {
                '.class': {
                    'width': "/env('var1')/",
                    "/call('myMixin')/": {}
                }
            },
            css: '.class{width:10px;color:red;}'
        },
        'define function in env': {
            jss: {
                '@env': {
                    myMixin: () => ({color: 'red'}),
                    var1: '10px'
                },
                '.class': {
                    'width': "/env('var1')/",
                    "/call('myMixin')/": {}
                }
            },
            css: '.class{width:10px;color:red;}'
        },
        'extractExpressions': {
            opts: {
                extractExpressions: true
            },
            jss: {
                '@env': {
                    color: 'red',
                    a: 1,
                    b: 1,
                    add:(a,b) => a + b,
                    width: "/call('add', env('a'), env('b'))/"
                },
                '.class': {
                    color: "/env('color')/",
                    width: "/env('width')/"
                }
            },
            css: `.class{color: var(${toVarName("/env('color')/")});width:var(${toVarName("/env('width')/")});}`,
            test(sheet, actions) {
                const varName = toVarName("/env('color')/");
                const varName2 = toVarName("/env('width')/");
                const exp = sheet.options.plugins[0];
                actions.compare(sheet.toString(), this.css);
                actions.compare(exp.env.extractedExpressions[varName].eval(), 'red');
                actions.compare(String(exp.env.extractedExpressions[varName2].eval()), '2');
                actions.compare(exp.env.toString(), `
                    :root {
                        ${varName}: red;
                        ${varName2}: 2;
                    }
                `);
                actions.compare(String(exp.env.get('width')), "2");
            }
        },

        'call function by call': {
            opts: {
                context: {
                    var1: '10px',
                },
                env: {
                    concat: (...args) => args.join('')
                }
            },
            jss: {
                '.class': {
                    'width': "/var1/",
                    "color": "/call('concat', 'r', 'e', 'd')/"
                }
            },
            css: '.class{width:10px;color:red;}'
        },
        'change env from external': {
            test(sheet, actions) {

                const exp = sheet.options.plugins[0];

                actions.compare(sheet.toString(), this.css);
                exp.options.env.var1 = '20px';
                actions.compare(sheet.toString(), this.css2);
                exp.options.env = {};
                actions.compare(sheet.toString(), this.css);

            },
            jss: {
                '@env': {
                    var1: '10px'
                },
                '.class': {
                    'width': "/env('var1')/",
                }
            },
            css: '.class{width:10px;}',
            css2: '.class{width:20px;}'
        },
        'change env from external (cached)': {
            opts:{cacheEnv: true},
            test(sheet, actions) {

                const exp = sheet.options.plugins[0];

                actions.compare(sheet.toString(), this.css);
                exp.options.env = exp.options.env || {};
                exp.options.env.var1 = '20px';

                actions.compare(sheet.toString(), this.css2);
                exp.options.env = {};

                actions.compare(sheet.toString(), this.css);

            },
            jss: {
                '@env': {
                    var1: '10px'
                },
                '.class': {
                    'width': "/env('var1')/",
                }
            },
            css: '.class{width:10px;}',
            css2: '.class{width:20px;}'
        },
        'grouping': {
            jss: {
                "/group('group1')/": {
                    '.class1': {
                        color: 'red'
                    }
                }
            },
            css: '.class1{color:red;}'
        },
        'localized env': {
            jss: {
                "/group('group1')/": {
                    '.class1': {
                        color: "`${env('color1')}`"
                    },
                    '@env': {
                        color1: 'red'
                    }
                }
            },
            css: '.class1{color:red;}'
        }
    }
};