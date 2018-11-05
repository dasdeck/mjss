import Extend from '../src/plugins/Extend';
import Exp from '../src/plugins/Exp';
import Nest from '../src/plugins/Nest';
import { Sheet } from '..';

export default {
    options: test => {
        const extend = new Extend(test.extend);
        return {
            plugins: [
                new Exp(test.exp),
                new Nest(test.nest),
                extend
            ]}
    },
    tests: {
        'test Extend can handle dynamic rules': {
            jss: {
                '@env': {
                    mixin: {
                        width: '10px'
                    }
                },
                '.class1': {
                    '@extend .class': {},
                    'height': '10px'
                },
                '.class': {
                    'color': 'red',
                    "/call('mixin')/": {}
                }
            },
            css: '.class1{height:10px;}.class, .class1{color:red;width:10px;}'
        },
        'use extend from conditional parent (true)': {
            jss: {
                '.targetClass': {
                    'color': 'red'
                },
                '.extenderClass': {
                    "/true/": {
                        '@extend .targetClass': {},
                        'width': '20px'
                    }
                }
            },
            css: '.targetClass, .extenderClass{color:red;}.extenderClass{width:20px;}'
        },
        'use extend from conditional parent (false)': {
            jss: {
                '.targetClass': {
                    'color': 'red'
                },
                '.extenderClass': {
                    "/false/": {
                        '@extend .targetClass': {},
                        'width': '20px'
                    }
                }
            },
            css: '.targetClass{color:red;}'
        },
        'extend and nested': {
            jss: {
                '.target': {
                    'color': 'black',
                    '&:hover': {
                        'color': 'green'
                    },
                },
                '.extender': {
                    '@extend .target': {all:true},
                    'color': 'red'
                }
            },
            css: '.target, .extender{color:black;}.target:hover, .extender:hover{color:green;}.extender{color:red;}'
        },
        'extend and nested (assumeStaticSelectors)': {
            extend: {assumeStaticSelectors: true},
            jss: {
                '.target': {
                    'color': 'black',
                    '&:hover': {
                        'color': 'green'
                    },
                },
                '.extender': {
                    '@extend .target': {all:true},
                    'color': 'red'
                }
            },
            css: '.target, .extender{color:black;}.target:hover, .extender:hover{color:green;}.extender{color:red;}'
        },
        'extend a target in mixin': {
            jss: {

                '@env': {
                    mixin: {
                        '.target': {
                            color: 'red'
                        }
                    }
                },
                '.extender': {
                    '@extend .target': {all: true},
                    color: 'green'
                },
                "/call('mixin')/": {}
            },
            css: '.extender{color:green;}.target, .extender{color:red;}'
        },
        'import from anywhere': {
            jss: {
                '.class': {
                    color: 'red',
                    "/call('import', 'test.css')/": {}
                }
            },
            css: "@import 'test.css';.class{color:red;}"
        },
        'test unique keys (nest)': {
            exp: {forceUniqueKeys: true},
            jss: {
                '@env': {
                    mixin: {
                        color: "/env('color')/",
                        '.subclass': {
                            color: "/env('color')/"
                        }
                    },
                },
                '.class': {
                    "/call('mixin', {color: 'red'})/": {},
                    "/call('mixin', {color: 'blue'})/": {},
                    color: 'green'
                }
            },
            css: '.class{color:green;} .class .subclass {color:red;} .class .subclass {color:blue;}'
        },
        'basic patch': {
            test(sheet:Sheet, actions) {
                const renderer1 = sheet.toRenderer();

                actions.compare(renderer1.toString(), this.css);

                const exp:Exp = sheet.options.plugins[0];
                exp.options.env = {
                    var1: 'blue',
                    path1: 'test2.css'
                };

                exp.env.buildCache();

                const renderer2 = sheet.toRenderer();

                const patch = renderer2.patch(renderer1);

                expect(patch).toEqual([
                    {
                        i: 0,
                        patch: {
                            value: "@import 'test2.css'"
                        }
                    },
                    {
                        i: 1,
                        patch: [
                            {
                                i:0,
                                patch: {
                                    key: 'color',
                                    value: 'blue',
                                    priority: undefined
                                }
                            }
                        ]
                    }
                ])

            },
            jss: {
                '@env':{
                    var1: 'red',
                    path1: 'test.css'
                },
                "/call('import', env('path1'))/": {},
                '.class1': {
                    color: "/env('var1')/"
                }
            },
            css: "@import 'test.css';.class1{color:red;}"
        }

    }
}