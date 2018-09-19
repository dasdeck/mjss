
/* eslint-env jest */

export default {
    tests: [
        {
            desc: 'static class',
            jss: {
                '.class': {
                    'color': 'black'
                }
            },
            css: '.class{color:black;}'
        },
        {
            desc: 'conditionals',
            jss: {
                '@media only screen and (max-width: 600px)': {
                    '.class1': {
                        'color': 'black'
                    }
                }
            },
            css: '@media only screen and (max-width: 600px){.class1{color:black;}}'
        }
    ]
};