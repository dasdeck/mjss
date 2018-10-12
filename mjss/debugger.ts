import {Sheet, Nest, Exp} from '.';


const sheet = new Sheet({plugins: [new Exp, new Nest]}, {
    "/group('group1')/": {
        '.class1': {
            color: 'red'
        }
    }
});

const res = sheet.toString();

console.log(res)