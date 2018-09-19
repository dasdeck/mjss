export default {
    tests: {
        mul: {
            less: '@var1:10px;@var2:5;.class{width: @var1 * @var2;}',
            jss: {
                '@env': {
                    var1: '10px',
                    var2: '5'
                },
                '.class': {
                    width: "/call('mul', env('var1'), env('var2'))/"
                }
            }
        },
        'pass numbers and units to nested calls': {
            less: '@var1:10px;@var2:5;.class{width: @var1 * @var2 + @var2;}',
            jss: {
                '@env': {
                    var1: '10px',
                    var2: '5'
                },
                '.class': {
                    width: "/call('add', call('mul', env('var1'), env('var2')), env('var2'))/"
                }
            }
        }
    }
}