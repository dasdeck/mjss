

import Sheet from './Sheet';
import RuleListRenderer from './RuleListRenderer';
import Renderable from './interface/Renderable';
import RuleRender from './RuleRenderer';

export default class Rule implements Renderable {

    sheet: Sheet
    parent: Rule

    key: any;
    value: any;

    constructor(sheet:Sheet, value:any, key:string, parent:Rule) {

        this.key = key;
        this.value = value;
        this.sheet = sheet;
        this.parent = parent;

        this.sheet.hook('onCreate', this);

    }

    valueOf() {
        return this.value;
    }

    render(renderer: RuleListRenderer) {

        const ruleRenderer = new RuleRender(this, renderer);
        this.sheet.hook('onProcess', ruleRenderer);
        renderer.children.push(ruleRenderer);
    }

}

