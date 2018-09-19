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