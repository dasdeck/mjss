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
        },
        'proper mixinb merging': {
            less: `@component: test;

            .hook-base-body() {
                -webkit-font-smoothing: antialiased;
            }

            .hook-base-body() when (@internal-base-body-mode = overlay) {
                position: relative;
            }

            @component: test2;

            .hook-base-body() {
            color: red;
            }`,

            jss: {
                "/group('test')/": {
                    "@env": {
                        "hook-base-body": {
                            "-webkit-font-smoothing": "antialiased",
                            "/env('internal-base-body-mode') === 'overlay'/": {
                            "position": "relative"
                            }
                        }
                    }
                },
                "/group('test2')/": {
                    "@env": {
                        "hook-base-body": {
                            "color": "red"
                        }
                    }
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