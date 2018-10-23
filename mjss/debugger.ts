import {Sheet, Nest, Exp} from '.';


const sheet = new Sheet({plugins: [new Exp({extractExpressions: true}), new Nest]}, {
    '@env': {
        a: '1px',
        b: '1px',
        width: "/call('add', env('a'), env('b'))/"
    },
    '.class': {
        width: "/env('width')/"
    }
});

const res = sheet.toString();

console.log(res)