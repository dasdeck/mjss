import {createSheet} from './test/utils';
import {less2mjss} from '.';
import {uikit} from './test/utils/lock';
import {staticFunctions} from './src/serverFunctions';
// const jss = less2mjss('@component: test; @media (max-width: 200px) {.class1{color: red;}}');
const jss = less2mjss(`
.svg-fill(@src, @color-default, @color-new, @property: background-image) {

	@escape-color-default: escape(@color-default);
	@escape-color-new: escape("@{color-new}");

	@data-uri: data-uri('image/svg+xml;charset=UTF-8', "@{src}");
	@replace-src: replace("@{data-uri}", "@{escape-color-default}", "@{escape-color-new}", "g");

	@{property}: e(@replace-src);
}

.class1{
	.svg-fill('${__dirname}/data/empty.svg', #000, blue);
}`, {staticFunctions});

const sheet = createSheet(jss);

const res = sheet.toString();

debugger;
