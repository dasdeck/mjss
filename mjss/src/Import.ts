import RuleListRenderer from "./RuleListRenderer";
import DirectiveRenderer from "./DirectiveRenderer";
import Directive from "./Directive";

export default class Import extends Directive {

    constructor(sheet, url) {
        super(sheet, url, null);
    }

    render(renderer: RuleListRenderer) {
        const ruleRenderer = new DirectiveRenderer(this, renderer);
        this.sheet.hook('onProcess', ruleRenderer);

        while(renderer.parent) {
            renderer = renderer.parent;
        }

        ruleRenderer.value =  `@import ${~['"', "'"].indexOf(ruleRenderer.value[0]) ? ruleRenderer.value : `'${ruleRenderer.value}'`}`;

        renderer.children.unshift(ruleRenderer);
    }

}