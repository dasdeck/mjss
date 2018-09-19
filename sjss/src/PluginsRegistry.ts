import {forEach} from 'lodash';

export default class PluginsRegistry {
    constructor(cssCompiler) {
        this.cssCompiler = cssCompiler;
        this.plugins = [];
    }

    call(name, ...args) {
        forEach(this.plugins, plugin => {
            if (plugin[name]) {
                plugin[name](...args);
            }
        });
    }

    use(plugin) {
        this.plugins.push(plugin);
    }
}
