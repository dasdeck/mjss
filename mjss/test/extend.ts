
/* eslint-env jest */

import Extend from '../src/plugins/Extend';

export default {
    options: test => ({plugins: [new Extend(test.opts)]}),
    tests: [
        {
            desc: 'extend',
            jss: {
                '.class:hover': {
                    'color': 'green'
                },
                '.class': {
                    'color': 'blue'
                },
                '.class1': {
                    '@extend .class': {},
                    'color': 'black'
                }
            },
            css: '.class:hover{color:green;}.class, .class1{color:blue;}.class1{color:black;}'
        },
        {
            desc: 'extend all',
            jss: {
                '.class:hover': {
                    'color': 'red'
                },
                '.class': {
                    'color': 'blue'
                },
                '.class1': {
                    '@extend .class': {all: true},
                    'color': 'black'
                }
            },
            css: '.class:hover, .class1:hover{color:red;}.class, .class1{color:blue;}.class1{color:black;}'
        },
        {
            desc: 'extend extended',
            jss: {
                '.target': {
                    color: 'red'
                  },

                  '.extender1': {
                    '@extend .extender2': {},
                    'color': 'red'
                  },

                  '.extender2': {
                    '@extend .target': {},
                    'color': 'red'
                  }


            },
            css: '.target, .extender2, .extender1{color:red;}.extender1{color:red;}.extender2, .extender1{color:red;}'
        },
        {
            desc: 'assumeStaticSelectors',
            opts: {assumeStaticSelectors: true},
            jss: {
                '.target': {
                    color: 'red'
                  },

                  '.extender1': {
                    '@extend .extender2': {},
                    'color': 'red'
                  },

                  '.extender2': {
                    '@extend .target': {},
                    'color': 'red'
                  }


            },
            css: '.target, .extender2, .extender1{color:red;}.extender1{color:red;}.extender2, .extender1{color:red;}'
        },
        {
            desc: 'extend an extender',
            jss: {
                ".tg1": {
                  "color": "red"
                },
                ".ext1": {
                  "@extend .tg1": {},
                  "color": "green"
                },
                ".ext2": {
                  "@extend .ext1": {},
                  "color": "blue"
                }
              },
            css: `.tg1, .ext1, .ext2{color:red;}.ext1, .ext2{color:green;}.ext2{color:blue;}`
         },
         {
             desc: 'extend complex selector',
             jss: {
                ".nav-pills > li > a": {
                  "padding": "10 10",
                  "@extend .uk-subnav-pill > * > a": {
                    "all": true
                  }
                },
                ".uk-subnav-pill > * > a:hover, .uk-subnav-pill > * > a:focus": {
                  "background-color": "red",
                  "color": "red"
                }
              },
              css: `
                    .nav-pills>li>a {
                        padding: 10 10;
                    }

                    .uk-subnav-pill>*>a:hover,
                    .uk-subnav-pill>*>a:focus,
                    .nav-pills>li>a:hover,
                    .nav-pills>li>a:focus {
                        background-color: red;
                        color: red;
                    }
              `
         },
         {
            desc: 'escaped class names',
            jss: {
                ".alignleft": {
                  "@extend .uk-align-left": {
                    "all": true
                  }
                },
                ".uk-align-left\\@s": {
                  "float": "left"
                }
            },
            css: `
                .uk-align-left\\@s {
                    float: left;
                }
            `
         },

         {
            desc: 'multi & multi target',
            jss: {
                ".extender": {
                    "@extend .target": {
                        "all": true
                    }
                },
                ".extender2": {
                    "@extend .target": {
                        "all": true
                    }
                },
                ".target, .extraSelector": {
                    "color": "red"
                }
            },
            css: `
                .target,
                .extraSelector,
                .extender,
                .extender2 {
                    color: red;
                }
            `
        }

    ]
};