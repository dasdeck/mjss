import {createSheet} from './test/utils';
import {less2mjss} from '.';
import {uikit} from './test/utils/lock';
import {staticFunctions} from './src/serverFunctions';
// const jss = less2mjss('@component: test; @media (max-width: 200px) {.class1{color: red;}}');
const jss = less2mjss(`

@global-color: #524f4f;

@global-muted-color: lighten(@global-color, 30%);
.muted { color: @global-muted-color; }

a.muted:hover,
a.muted:focus { color: darken(@global-muted-color, 10%); }

	`, {staticFunctions});

const sheet = createSheet(jss);

const res = sheet.toString();

debugger;
