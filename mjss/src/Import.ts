import RuleListRenderer from "./RuleListRenderer";
import DirectiveRenderer from "./DirectiveRenderer";
import Directive from "./Directive";

export default class Import extends Directive {

    render(renderer: RuleListRenderer) {
        const ruleRenderer = new DirectiveRenderer(this, renderer);
        this.sheet.hook('onProcess', ruleRenderer);

        while(renderer.parent) {
            renderer = renderer.parent;
        }

        const value = ~['"', "'"].indexOf(ruleRenderer.value[0]) ? ruleRenderer.value : `'${ruleRenderer.value}'`;
        renderer.children.unshift(`@import ${value};`);
    }

}