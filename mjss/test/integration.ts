import Extend from '../src/plugins/Extend';
import Exp from '../src/plugins/Exp';
import Nest from '../src/plugins/Nest';

export default {
    options: test => ({plugins: [
        new Exp,
        new Nest,
        new Extend(test.extend),
    ]}),
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
        }
    }
}