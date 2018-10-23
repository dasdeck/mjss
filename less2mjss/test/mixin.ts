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
        // 'svg-fill': {
        //     less: `
        //         .svg-fill(@src, @color-default, @color-new, @property: background-image) {

        //             @escape-color-default: escape(@color-default);
        //             @escape-color-new: escape("@{color-new}");

        //             @data-uri: data-uri('image/svg+xml;charset=UTF-8', "@{src}");
        //             @replace-src: replace("@{data-uri}", "@{escape-color-default}", "@{escape-color-new}", "g");

        //             @{property}: e(@replace-src);
        //         }

        //         .class1{
        //             .svg-fill('${__dirname}/data/empty.svg', #000, blue);
        //         }
        //     `,
        //     jss: {
        //         ".class1": {
        //             "`${'background-image'}`": "`url(\"${'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%20%20%3Crect%20fill%3D%22%23000%22%20x%3D%229%22%20y%3D%221%22%20width%3D%221%22%20height%3D%2217%22%20%2F%3E%0A%20%20%20%20%3Crect%20fill%3D%22%23000%22%20x%3D%221%22%20y%3D%229%22%20width%3D%2217%22%20height%3D%221%22%20%2F%3E%0A%3C%2Fsvg%3E'.replace(new RegExp(encodeURIComponent('#000'), 'g'), 'blue')}\")`"
        //         }
        //     }

        // }
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