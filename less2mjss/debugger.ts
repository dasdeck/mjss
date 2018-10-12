import {createSheet} from './test/utils';
import {less2mjss} from '.';
import {uikit} from './test/utils/lock';

// const jss = less2mjss('@component: test; @media (max-width: 200px) {.class1{color: red;}}');
const jss = less2mjss('.table { &:extend(.uk-table); }.uk-table{color: red;}');
const sheet = createSheet(jss);

const res = sheet.toString();

debugger;
