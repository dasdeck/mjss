
/* eslint-env jest */

export default {
    tests: [
        {
            desc: 'simple extend',
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
        {
            desc: 'all extend and nested',
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
        }

    ]
};