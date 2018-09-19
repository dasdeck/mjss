
/* eslint-env jest */

export default {
    tests: [
        {
            desc: 'basic multiplication',
            expression: "mul(2, '10px')",
            result: '20px'
        },
        {
            desc: 'nested multiplication and addition',
            expression: "add('50px',mul(2, '10px'))",
            result: '70px'
        },
        {
            desc: 'basic multiplication with context',
            context: {
                var1: 2
            },
            expression: "mul(var1, '10px')",
            result: '20px'
        },
        {
            desc: 'basic multiplication with unit context',
            context: {
                var1: '10px'
            },
            expression: "mul(var1, 2)",
            result: '20px'
        }
    ]
};