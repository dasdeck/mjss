import Rule from "../../Rule";
import ContainerRuleRenderer from "../../ContainerRuleRenderer";
import { patternExtend } from "./lib";


export default class ExtendRule extends Rule {

    className: string
    search: RegExp
    replace: RegExp
    currentParrent: ContainerRuleRenderer
    transformations: Array<Function> = []

    constructor(sheet, data, key, parent) {
        super(sheet, data, key, parent);

        const className = this.key.substr(patternExtend.length);
        const prefix = className[0] === '.' ? '.' : '';
        const search = className.substr(prefix.length);
        this.className = className;
        if (this.value.all) {
            this.search = new RegExp(/prefix(?:\b)search(?:\b[^-]|$)/g.source.replace('prefix', prefix).replace('search', search));
        } else {
            this.search = new RegExp(/(?:,|^)\s*prefix(?:\b)search(?:\b\s*(?:,|$))/g.source.replace('prefix', prefix).replace('search', search));
        }
        this.replace  = new RegExp(this.search.source, 'g');


    }

    render(r:ContainerRuleRenderer) {
        this.currentParrent = r;
    }


    getTargetSelector() {

        return this.currentParrent && this.currentParrent.key;
    }

    apply() {
        // console.log({trans: this.transformations.length, selector: this.getTargetSelector()});
        this.transformations.forEach(t => t());
        this.transformations = [];
    }

    collect(renderer) {

        if (renderer.key && renderer.key.match(this.search)) {

            this.transformations.push(() => {
                const targetSelector = this.getTargetSelector();
                if (targetSelector) {

                    const selectors = renderer.key.split(', ');
                    if (this.value.all) {
                        selectors.forEach(selector => {
                            if (selector.match(this.search)) {
                                selectors.push({toString:() => selector.replace(this.className, targetSelector)});
                            }
                        });
                    } else {
                        selectors.push(targetSelector);
                    }

                    renderer.key = selectors.join(', ');
                }
            });


        }

    }

}
