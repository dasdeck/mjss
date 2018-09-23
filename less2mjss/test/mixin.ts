export default {
    tests: {
        'pure mixin': {
            less: '.pureMixin1() {color: red;}.tester{.pureMixin1;}',
            jss: {
                '@env': {
                    pureMixin1: {
                        color: 'red'
                    }
                },
                '.tester': {
                    "/call('pureMixin1')/": {}
                }
            }
        },
        'paramter mixins': {
            less: '.pureMixin1(@color) {color: @color;}.tester{.pureMixin1(red);}',
            jss: {
                '@env': {
                    pureMixin1: {
                        color: "/env('color')/"
                    }
                },
                '.tester': {
                    "/call('pureMixin1', {'color': 'red'})/": {}
                }
            }
        },
        'conditional mixin': {
            less: '@var1:0;.mixin() when (@var1 = 0){color:red;}.class1{.mixin;}',
            jss: {
                '@env': {
                    var1: 0,
                    mixin: {
                        "/env('var1') === 0/" : {
                            color: 'red'
                        }
                    }
                },
                '.class1': {
                    "/call('mixin')/": {}
                }
            }
        }
        // TODO
        // 'inline mixin': {
        //     less: '.pureMixin1 {color: red;}.tester{.pureMixin1;}',
        //     jss: {
        //         '@env': {
        //             pureMixin1: {
        //                 color: 'red'
        //             }
        //         },
        //         '.tester': {
        //             "/call('pureMixin1')/": {}
        //         }
        //     }
        // }
    }
}