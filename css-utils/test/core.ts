
/* eslint-env jest */

export default {
    tests: {
        'basic multiplication': {
            expression: "mul(2, '10px')",
            result: '20px'
        },
        'nested multiplication and addition': {
            expression: "add('50px',mul(2, '10px'))",
            result: '70px'
        },
        'basic division with context': {
            context: {
                var1: 2
            },
            expression: "div('10px', 2)",
            result: '5px'
        },
        'basic multiplication with unit context': {
            context: {
                var1: '10px'
            },
            expression: "mul(var1, 2)",
            result: '20px'
        },
        'invalid numberss': {
            expression: "mul('foo', 'bar')",
            exception:'foo is not a number'
        }
    }
};