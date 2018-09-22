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
        'lighten': '.c{color:lighten(red,10%)}',
        'fade ': '.c{color:fade(red,10%)}',
        'fadeout ': '.c{color:fadeout(red, 10%)}',
        'saturate ': '.c{color:saturate(blue, 10%)}',
        'desaturate ': '.c{color:desaturate(blue, 10%)}',
        'mix ': '.c{color:mix(red, blue, 10%)}',
        'tint ': '.c{color:tint(red, 10%)}',
        'spin ': '.c{color:spin(red, 10%)}',
        "edge1": '.c{color:tint(#faa05a, 45%)}',
        "edge2": '.c{color:lighten(tint(#faa05a, 45%), 15%)}'
    }
}