import Sheet from './Sheet';
import RuleListRenderer from './RuleListRenderer';
import RuleRender from './RuleRenderer';
import Directive from './Directive';

export default class Rule extends Directive {

    key: any;

    constructor(sheet:Sheet, value:any, key:string, parent:Rule) {
        super(sheet, value, parent);
        this.key = key;
    }

    render(renderer: RuleListRenderer) {
        const ruleRenderer = new RuleRender(this);
        this.sheet.hook('onProcess', ruleRenderer);
        renderer.children.push(ruleRenderer);
    }

}

