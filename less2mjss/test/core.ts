
/* eslint-env jest */

export default {
    tests: [
        {
            desc: 'simple static class',
            jss: {
                '.class': {
                    'color': 'black'
                }
            },
            less: '.class{color:black;}'
        },
        {
            desc: 'simple variable definition',
            less: '@var1: 5px;',
            jss: {
                '@env': {
                    'var1': '5px'
                }
            }
        },
        {
            desc: 'expression definition',
            less: '@var1: 5px; @var2: 10 * @var1;',
            jss: {
                '@env': {
                    'var1': '5px',
                    'var2': "/call('mul', 10, env('var1'))/"
                }
            }
        },
        {
            desc: 'static calculation',
            less: '@var1: 10 * 5px;',
            jss: {
                '@env': {
                    'var1': '50px'
                }
            }
        }
    ]
};