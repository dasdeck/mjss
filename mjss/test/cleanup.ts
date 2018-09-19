
import Cleanup from '../src/plugins/Cleanup';

export default {
    options: test => ({plugins: [new Cleanup]}),
    tests: [
        {
            jss: {
                ".class": {
                    content: '100px'
                }
            },
            css: ".class{content:'100px';}"
        }
    ]
}