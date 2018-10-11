import RuleListRenderer from "../../RuleListRenderer";
import ContainerRuleRenderer from "../../ContainerRuleRenderer";
import {startsWith} from 'lodash'

const containerKeys = [ // according to https://developer.mozilla.org/de/docs/Web/CSS/At-rule
    '@media',
    '@supports',
    '@document',
    '@page',
    '@font-face',
    '@keyframes',
    '@viewport',
    '@-moz'
];

export const reExplicitNest = /&/g;

export function isContainer(renderer:RuleListRenderer) {
    if (!renderer.parent) {
        return true;
    } else if (renderer instanceof ContainerRuleRenderer) {
        return containerKeys.some(key => startsWith(renderer.key, key));
    }
}

const bubblingRules = [ // according to https://developer.mozilla.org/de/docs/Web/CSS/At-rule
    '@media',
    '@supports'
];

export function isBubbling(renderer:ContainerRuleRenderer) {

    return bubblingRules.some(key => startsWith(renderer.key, key));
}