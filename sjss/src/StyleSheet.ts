import {merge, forEach, isObject, cloneDeep, isPlainObject} from 'lodash';
import {iterateClone} from './plugins/lib';
export default class StyleSheet {
    constructor(style, cssCompiler) {
        this.style = style;
        this.cssCompiler = cssCompiler;
    }

    addRules(rules) {
        merge(this.style, rules);
    }

    with(rules) {
        const cloneStyle = cloneDeep(this.style);
        const style = new StyleSheet(cloneStyle, this.cssCompiler);
        style.addRules(rules);
        return style;
    }

    // @unused!
    processRules(node = this.style) {
        forEach(node, (value, key) => {
            this.cssCompiler.plugins.call('onRule', key, value, node);

            if (isObject(value)) {
                this.processRules(value);
            }
        });
    }

    convertToString(node, pkey = null, parent = null) {
        let cssCode = '';
        const format = false;
        const indent = parent && format ? '\t' : '';
        const nl = format ? '\n' : '';

        const parentInfo = {node, key: pkey, parent};

        forEach(node, (value, key) => {

            this.cssCompiler.plugins.plugins.forEach(plugin => {
                if (plugin.onRender) {
                    value = plugin.onRender(value, key, parentInfo);
                }
            });

            if (isPlainObject(value)) {
                // is nested
                cssCode += indent + key + ' {' + nl;
                cssCode += indent + this.convertToString(value, key, parentInfo);
                cssCode += indent + '}' + nl;
            } else if (typeof value !== 'undefined') {
                // not nested
                cssCode += indent + key + ': ' + (value.toString && value.toString() || value) + ';' + nl;
            } else {
                debugger
            }
        });
        return cssCode;
    }

    processPlugins() {

        let style = cloneDeep(this.style);

        // this.cssCompiler.plugins.call('onProcessSheet', style);

        style = iterateClone(style, (node, key, parent) => {

            this.cssCompiler.plugins.plugins.forEach(plugin => {
                node = plugin.onRule && plugin.onRule(node, key, parent, style) || node;
            });

            return node;

        });

        this.cssCompiler.plugins.plugins.forEach(plugin => {
            style = plugin.onProcessSheet && plugin.onProcessSheet(style) || style;
        });

        return style;
    }

    toString() {

        const style = this.processPlugins();

        return this.convertToString(style);
    }

}
