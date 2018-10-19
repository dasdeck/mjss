export default {
    tests: {
        'darken (test call)': {
            less: '.c{color:darken(red,5%)}',
            jss: {
                '.c': {
                    color: "/call('darken', 'red', '5%')/"
                }
            }
        },
        'immutability': {
            less: `@color1: red;@color2: darken(@color1, 30%); .class1{color: @color1; background-color: @color2}`,
            jss: {
                '@env': {
                    color1: 'red',
                    color2: "/call('darken', env('color1'), '30%')/"
                },
                '.class1': {
                    color: "/env('color1')/",
                    'background-color': "/env('color2')/"
                }
            }
        },
        'lighten': '.c{color:lighten(red,10%)}',
        'fade': '.c{color:fade(red,10%)}',
        'fade2': '.c{color:fade(#fff,70%)}',
        'fadeout': '.c{color:fadeout(red, 10%)}',
        'saturate': '.c{color:saturate(blue, 10%)}',
        'desaturate': '.c{color:desaturate(blue, 10%)}',
        'mix': '.c{color:mix(red, blue, 10%)}',
        'tint': '.c{color:tint(red, 10%)}',
        'spin': '.c{color:spin(red, 10%)}',
        "edge1": '.c{color:tint(#faa05a, 45%)}',
        "grey": '.c{color:lighten(#524f4f, 30%)}'
        // "edge2": '.c{color:lighten(tint(#faa05a, 45%), 15%)}'
    }
}