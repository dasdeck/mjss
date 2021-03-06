
/* eslint-env jest */

export default {
    tests: {
        'simple extend': {
            less: '.target{color:black;}.extender:extend(.target){color:red;}',
            jss: {
                '.target': {
                    'color': 'black'
                },
                '.extender': {
                    '@extend .target': {},
                    'color': 'red'
                }
            }
        },
        'all extend and nested': {
            less: '.target{color:black;&:hover{color:green;}}.extender:extend(.target all){color:red;}',
            jss: {
                '.target': {
                    'color': 'black',
                    '&:hover': {
                        'color': 'green'
                    },
                },
                '.extender': {
                    '@extend .target': {all: true},
                    'color': 'red'
                }
            },
            css: '.target,.extender{color:black;}.target:hover,.extender:hover{color:green;}.extender{color:red;}'
        },
        'extend syntax 2': {
            less: '.target{color:black;&:hover{color:green;}}.extender{&:extend(.target all);color:red;}',
            jss: {
                '.target': {
                    'color': 'black',
                    '&:hover': {
                        'color': 'green'
                    },
                },
                '.extender': {
                    '@extend .target': {all: true},
                    'color': 'red'
                }
            },
            css: '.target,.extender{color:black;}.target:hover,.extender:hover{color:green;}.extender{color:red;}'
        },
        'multi-mulit-extend': {
            less: '.target1:hover, .target1:active{color:black;}.target2{color:red;}.extender, .extender2, .extender3{&:extend(.target1 all,.target2 all);color:green;}',
            jss: {
                '.target1:hover, .target1:active': {
                    color:'black'
                },
                '.target2': {
                    color: 'red'
                },
                '.extender, .extender2, .extender3': {
                    '@extend .target1': {all: true},
                    '@extend .target2': {all: true},
                    color: 'green'
                }
            }
        },
        'multi-extend': {
            less: '.target1{color:black;}.target2{color:red;}.extender{&:extend(.target1,.target2);color:green;}',
            jss: {
                '.target1': {
                    color:'black'
                },
                '.target2': {
                    color: 'red'
                },
                '.extender': {
                    '@extend .target1': {},
                    '@extend .target2': {},
                    color: 'green'
                }
            }
        },
        'matching test': {
            less: '.test > .target .more {color: red} .extender { &:extend(.target all); }',
            jss: {
                '.test > .target .more': {
                    color: 'red'
                },
                '.extender': {
                    '@extend .target': {all: true}
                }
            }
        },
        'iterated selector': {
            less: `
            .navbar .nav > li > .dropdown-menu {
                border: none;
                padding: 0;
            }
            .navbar .nav > li > .dropdown-menu { &:extend(.uk-navbar-dropdown all); }
            .uk-navbar-dropdown.uk-open { display: block; }

            `,
            jss: {
                '.navbar .nav > li > .dropdown-menu': {
                    border: 'none',
                    padding: "0"
                },
                '.navbar .nav > li > .dropdown-menu /* id:2 */': {
                    '@extend .uk-navbar-dropdown': {all: true}
                },
                '.uk-navbar-dropdown.uk-open': {
                    display: 'block'
                }
            }
        },
        'match full complex selector': {
            less: `.nav-tabs > li {
                &:extend(.uk-tab > *);
            }

            .uk-tab > * {
                flex: none;
                position: relative;
            }`,
            jss: {
                ".nav-tabs > li": {
                  "@extend .uk-tab > *": {}
                },
                ".uk-tab > *": {
                  "flex": "none",
                  "position": "relative"
                }
            }
        },
        'prevent double extension': {
            less: `
                .uk-light {
                    .uk-list-divider > li:nth-child(n+2) {
                        border-top-color: red;
                    }
                }

                .tm-toolbar:extend(.uk-light all) {}

                .tm-child-list-divider > ul:extend(.uk-list-divider all) {}
            `
        },
        'prevent extending nested case': {
            less: `
            .label, a.label { &:extend(.uk-label); }

            .hook-inverse() {
                .uk-label {
                    color: red;
                }
            }

            .uk-inverse {
                .hook-inverse;
            }
            `,
            jss:{
                ".label, a.label": {
                  "@extend .uk-label": {}
                },
                ".uk-inverse": {
                  "/call('hook-inverse')/": {}
                },
                "@env": {
                  "hook-inverse": {
                    ".uk-label": {
                      "color": "red"
                    }
                  }
                }
            },
            css: `
            .uk-inverse .uk-label {
                color: red;
            }`
        }
    }
};