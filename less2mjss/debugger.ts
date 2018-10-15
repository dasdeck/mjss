import {createSheet} from './test/utils';
import {less2mjss} from '.';
import {uikit} from './test/utils/lock';

// const jss = less2mjss('@component: test; @media (max-width: 200px) {.class1{color: red;}}');
const jss = less2mjss(`
.btn:extend(.uk-button all, .uk-button-default all) {
	display: inline-block;
	margin-bottom: 0;
	vertical-align: middle;
	cursor: pointer;
}

.uk-button-group > .uk-button:nth-child(n+2),
.uk-button-group > div:nth-child(n+2) .uk-button {
	margin-left: -1px;
}
`);
const sheet = createSheet(jss);

const res = sheet.toString();

debugger;
