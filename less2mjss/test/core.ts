
/* eslint-env jest */

export default {
    tests: {
        'simple static class': {
            jss: {
                '.class': {
                    'color': 'black'
                }
            },
            less: '.class{color:black;}'
        },
        'simple variable definition':{
            less: '@var1: 5px;',
            jss: {
                '@env': {
                    'var1': '5px'
                }
            }
        },
        'expression definition': {
            less: '@var1: 5px; @var2: 10 * @var1;',
            jss: {
                '@env': {
                    'var1': '5px',
                    'var2': "/call('mul', 10, env('var1'))/"
                }
            }
        },
        'static calculation':{
            less: '@var1: 10 * 5px;',
            jss: {
                '@env': {
                    'var1': '50px'
                }
            }
        },
        'handle pure native function': {
            less: '.class{width:rgba(5,5,5,0.5)}',
            jss: {
                '.class': {
                    'width': "rgba(5, 5, 5, 0.5)"
                }
            }
        },
        'handle native function with dynamics': {
            less: '@var1:5;.class{width:rgba(@var1*5,5,5,0.5)}',
            jss: {
                '@env': {
                    var1: 5
                },
                '.class': {
                    'width': "/nf('rgba', call('mul', env('var1'), 5), 5, 5, 0.5)/"
                }
            }
        },
        'handle font-family': {
            less: '.class{font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;}',
            jss: {
                '.class': {
                    'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }
            }
        },
        'handle font-family via vars': {
            less: '@fam1:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;.class{font-family: @fam1;}',
            jss: {
                '@env': {
                    fam1: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                },
                '.class': {
                    'font-family': "/env('fam1')/"
                }
            }
        },
        'handle content': {
            less: "@var1:10px;.class1{content:'@{var1}'}",
            jss: {
                '@env': {
                    var1: '10px'
                },
                '.class1': {
                    'content': "`'${env('var1')}'`"
                }
            }
        },
        'handle escaped content': {
            // focus: true,
            less: "@var1:10px;.class1{top:~'calc(@{var1} + 2)'}",
            jss: {
                '@env': {
                    var1: '10px'
                },
                '.class1': {
                    'top': "`calc(${env('var1')} + 2)`"
                }
            }
        }

    }
};