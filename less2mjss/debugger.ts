import {createSheet} from './test/utils';
import {less2mjss} from '.';
import {uikit} from './test/utils/lock';
import * as less from 'less';
// const jss = less2mjss('@component: test; @media (max-width: 200px) {.class1{color: red;}}');


const source = `
.class1{background-image: data-uri("image/svg+xml;charset=UTF-8", "./test/data/empty.svg");}
`

const jss = less2mjss(source);
let lessCss;
less.render(source, (err,res) => {
	debugger;
	lessCss = res.css;
});

debugger

const sheet = createSheet({
	'.target': {
		'color': 'black',
		'&:hover': {
			'color': 'green'
		},
	},
	'.extender': {
		'@extend .target': {all:true},
		'color': 'red'
	}
});

const res = sheet.toString();

debugger;
