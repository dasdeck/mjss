
/* eslint-env jest */

export default {
    tests: [
        {
            desc: 'simple extend',
            jss: {
                '.target': {
                    'color': 'black'
                },
                '.extender': {
                    '@extend .target': {},
                    'color': 'red'
                }
            },
            less: '.target{color:black;}.extender:extend(.target){color:red;}'
        },
        {
            desc: 'all extend and nested',
            jss: {
                '.target': {
                    'color': 'black',
                    '&:hover': {
                        'color': 'green'
                    },
                },
                '.extender': {
                    '@extend .target': {},
                    'color': 'red'
                }
            },
            less: '.target{color:black;&:hover{color:green;}}.extender:extend(.target){color:red;}'
        }

    ]
};