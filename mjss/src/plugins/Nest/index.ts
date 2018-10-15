import ContainerRuleRenderer from "../../ContainerRuleRenderer";
import { isContainer, reExplicitNest, isBubbling } from "./lib";


function combineKeys(pkey, cKey) {
    const pKeys = pkey.split(', ');
    const sKeys = cKey.split(', ');
    const newKey = sKeys.map(sKey => {
        return pKeys.map(pKey =>  {
            const replaced = sKey.replace(reExplicitNest, pKey);
            return replaced !== sKey ? replaced : `${pKey} ${sKey}`;
        }).join(', ')
    }).join(', ');

    return newKey;
}
export default class Nest {

    options:any;

    constructor(options:any = {}) {
        this.options = options;
    }

    onProcess(renderer:ContainerRuleRenderer) {

        if (renderer instanceof ContainerRuleRenderer) {


            let parentIsContainer = isContainer(renderer.parent);

            const bubbleRender = (renderer as any);
            bubbleRender._bubbles = !parentIsContainer && isBubbling(renderer) && [];

            while (!parentIsContainer) {

                const oldKey = renderer.key;
                if (bubbleRender._bubbles) {
                    bubbleRender._bubbles.push(renderer.parent.key);
                } else {
                    renderer.key = combineKeys(renderer.parent.key, oldKey);
                }

                renderer = renderer.parent.children.pop();

                if (this.options.onNest) {
                    this.options.onNest(renderer, oldKey)
                }

                renderer.parent = renderer.parent.parent;

                renderer.parent.children.push(renderer);

                parentIsContainer = isContainer(renderer.parent);
            }

            if (parentIsContainer && renderer.parent._bubbles) {

                renderer.parent._bubbles.forEach(pkey => {
                    renderer.key = combineKeys(pkey, renderer.key)
                })

            }
        }

    }
};

