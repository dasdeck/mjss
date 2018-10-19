
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
        },
        'two media in mixin': {
            less: ".hook1(){ @media (min-width: 100px) { .class1{color:red}} @media (min-width: 100px) { .class2{width:100px;}} }",
            jss: {
                '@env': {
                    hook1: {
                        '@media (min-width: 100px)': {
                            '.class1': {
                                color: 'red'
                            }
                        },
                        '@media (min-width: 100px) /* id:2 */': {
                            '.class2': {
                                width: '100px'
                            }
                        }
                    }
                }
            }
        },
        'text-shadow': {
            less: '@val: -2px -2px 0 darken(red, 10%), 2px 2px 0 rgba(208, 33, 68, 0.3); .class1{text-shadow: @val;}',
            jss: {
                '@env': {
                    val: "`${`${'-2px'} ${'-2px'} ${0} ${call('darken', 'red', '10%')}`}, ${`${'2px'} ${'2px'} ${0} ${nf('rgba', 208, 33, 68, 0.3)}`}`"
                },
                '.class1': {
                    'text-shadow': "/env('val')/"
                }
            }
        },
        'url': {
            less: '@val: "test"; .class1{background-image: url("@{val}");}',
            jss: {
                '@env': {
                    val: "\"test\""
                },
                '.class1': {
                    'background-image': "/nf('url', `${env('val')}`)/"
                }
            }
        },
        'font division bug': {
            less: '.class1{font: 0/0 a;}',
            jss: {
                '.class1': {
                    font: '0/0 a'
                }
            }
        },
        '@import': {
            less: "@internal-fonts: 'test'; .font() when not (@internal-fonts = ~'') { @import 'https://fonts.googleapis.com/css?family=@{internal-fonts}';} .font();",
            jss: {
                '@env': {
                    font: {
                        "/!(env('internal-fonts') === '')/": {
                            "/call('import', `'https://fonts.googleapis.com/css?family=${envu('internal-fonts')}'`)/": {}
                        }
                    },
                    'internal-fonts': "'test'"
                },
                "/call('font')/": {}
            }
            // css: `@import "https://fonts.googleapis.com/css?family='test'";`
        },
        'iterated selectors': {
            less: '.class1{color:red}.class1{color:green}',
            jss: {
                '.class1': {
                    color: 'red'
                },
                '.class1 /* id:2 */': {
                    color: 'green'
                }
            }
        },
        'data-uri svg': {
            less: `.class1{background-image: data-uri("image/svg+xml;charset=UTF-8", "${__dirname}/data/empty.svg");}`,
            jss: {
                '.class1': {
                    'background-image': 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%20%20%3Crect%20fill%3D%22%23000%22%20x%3D%229%22%20y%3D%221%22%20width%3D%221%22%20height%3D%2217%22%20%2F%3E%0A%20%20%20%20%3Crect%20fill%3D%22%23000%22%20x%3D%221%22%20y%3D%229%22%20width%3D%2217%22%20height%3D%221%22%20%2F%3E%0A%3C%2Fsvg%3E")'
                }
            }
        }

    }
};