import Stringable from './interface/Stringable';
import Sheet from './Sheet';
import RuleList from './RuleList';
import {assign} from 'lodash';

export default class RuleListRenderer implements Stringable {

    root: RuleList
    list: RuleList
    parent: RuleListRenderer|any
    children: Array<Stringable>
    sheet: Sheet

    constructor(list: RuleList, parent: RuleListRenderer = null) {

        assign(this, {
            sheet: list.sheet,
            parent,
            list,
            children: []
        });

        if (parent) {
            parent.children.push(this);
        }
    }

    patch(old):any  {
        if (this.children.length !== old.children.length) {
            throw 'structural mismatch';
        }

        const patches = [];

        for (let i = 0; i < this.children.length; i++) {
            const oldChild:any = old.children[i];
            const newChild:any = this.children[i];
            const patch = newChild.patch(oldChild);
            if (patch) {
                patches.push({
                    i,
                    patch
                });
            }
        }

        return patches.length && patches;
    }

    toString() {

        return <string>this.children.reduce((e, v) => e + v.toString(), '');

    }
}