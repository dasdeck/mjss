import {createSheet} from './test/utils';
import {less2mjss} from '.';
import {uikit} from './test/utils/lock';

// const jss = less2mjss('@component: test; @media (max-width: 200px) {.class1{color: red;}}');
// const jss = less2mjss(`

// 		.label, a.label { &:extend(.uk-label); }

// 		.hook-inverse() {
// 			.uk-label {
// 				color: red;
// 			}
// 		}

// 		.uk-inverse {
// 			.hook-inverse;
// 		}

// 	`);

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
