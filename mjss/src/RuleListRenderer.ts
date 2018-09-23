import Renderable from './interface/Renderable';
import Sheet from './Sheet';
import RuleList from './RuleList';
import {assign} from 'lodash';

export default class RuleListRenderer implements Renderable {

    root: RuleList
    list: RuleList
    parent: RuleListRenderer|any
    children: Array<Renderable>
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

    toString() {

        return <string>this.children.reduce((e, v) => e + v.toString(), '');

    }
}