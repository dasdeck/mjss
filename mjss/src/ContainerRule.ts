import Rule from './Rule';
import ContainerRuleRenderer from './ContainerRuleRenderer';
import RuleList from './RuleList';
import RuleListRenderer from './RuleListRenderer';
import Sheet from './Sheet';

export default class ContainerRule extends Rule {

    rules: RuleList

    constructor(sheet:Sheet, data:any, key:string = null, parent:Rule = null) {

        super(sheet, data, key, parent);
        this.setRules(data);
    }

    setRules(data:any) {
        this.rules = new RuleList(this.sheet, data, this);

    }

    render(parentRenderer:RuleListRenderer) {

        const renderer = new ContainerRuleRenderer(this, parentRenderer);

        this.sheet.hook('onProcess', renderer);
        this.rules.render(renderer);


    }

}