import Rule from "./Rule";
import RuleListRenderer from "./RuleListRenderer";
import Sheet from "./Sheet";
import DirectiveRenderer from "./DirectiveRenderer";
import Renderable from "./interface/Renderable";

export default class Directive implements Renderable {

    sheet: Sheet
    value: any
    parent: Rule

    constructor(sheet:Sheet, value: string, parent:Rule) {
        this.value = value;
        this.sheet = sheet;
        this.parent = parent;
    }

    valueOf() {
        return this.value;
    }

    render(renderer: RuleListRenderer) {
        const ruleRenderer = new DirectiveRenderer(this, renderer);
        this.sheet.hook('onProcess', ruleRenderer);
        renderer.children.push(ruleRenderer);
    }

}