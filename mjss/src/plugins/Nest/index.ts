import ContainerRuleRenderer from "../../ContainerRuleRenderer";
import { isContainer, reExplicitNest } from "./lib";

export default class Nest {

    onProcess(renderer:ContainerRuleRenderer) {

        if (renderer.rule.rules) {

            while (renderer.parent && !isContainer(renderer.parent)) {

                const pKeys = renderer.parent.key.split(', ');
                const sKeys = renderer.key.split(', ');
                const newKey = sKeys.map(sKey => {
                    return pKeys.map(pKey =>  {

                        const replaced = sKey.replace(reExplicitNest, pKey);
                        return replaced !== sKey ? replaced : `${pKey} ${sKey}`;
                    }).join(', ')
                }).join(', ');

                renderer.key = newKey;
                renderer = renderer.parent.children.pop();
                renderer.parent = renderer.parent.parent;

                renderer.parent.children.push(renderer);

            }
        }
    }
};

