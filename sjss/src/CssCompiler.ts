import StyleSheet from './StyleSheet';
import PluginsRegistry from './PluginsRegistry';

export default class CssCompiler {
    constructor() {
        this.styles = this.styles || [];
        this.plugins = new PluginsRegistry(this);
    }

    setup(options, plugins) {
        // set options
        this.options = options;
        if (plugins !== undefined) this.use(plugins);
    }

    createStylesheet(style = {}) {
        // register style
        const sheet = new StyleSheet(style, this);
        this.styles.push(sheet);

        return sheet;
    }

    use(plugins) {
        this.plugins.use(plugins);
    }
}
