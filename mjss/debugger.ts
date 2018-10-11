import {Sheet, Nest, Exp} from '.';


const sheet = new Sheet({plugins: [new Exp, new Nest]}, {
    '@env': {
        font: {
            "/!(env('internal-fonts') === '')/": {
                "/call('import', `https://fonts.googleapis.com/css?family=${unquote(env('internal-fonts'))}`)/": {}
            }
        },
        'internal-fonts': "'test'"
    },
    "/call('font')/": {}
});

const res = sheet.toString();

console.log(res)