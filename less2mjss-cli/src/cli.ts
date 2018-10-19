import {less2mjss} from 'less2mjss';
import {concatLessSource, replaceLessSource, stripComments} from 'less2mjss/test/utils'
import {lockOptions} from 'less2mjss/test/utils/lock'
import {staticFunctions} from 'less2mjss/src/serverFunctions'
import {Sheet} from 'mjss';
import {css_beautify as cssFormat} from 'js-beautify';

import * as less from 'less';

import * as glob from 'glob';

import * as path from 'path';
import * as fs from 'fs';

import * as diff from 'diff';
import {Diff2Html} from 'diff2html';
import * as mkpath from 'mkpath';

const templateIndex = process.argv.indexOf('template')+1;
const produceDiff = ~process.argv.indexOf('diff');
const useCache = ~process.argv.indexOf('cache');
const cacheDir = path.join(process.cwd(), '.less2mjss');
const inline = process.argv.indexOf('inline') + 1 && process.argv[process.argv.indexOf('inline') + 1];

const template = templateIndex && process.argv[templateIndex] || '';
const pattern = path.isAbsolute(process.argv[2]) ? process.argv[2] : path.join(process.cwd(), process.argv[2]);
const files = glob.sync(pattern);

const settings = JSON.stringify(process.argv.slice(2), null, 2);

const diff2htmlResPath = path.dirname(require.resolve('diff2html'));
const diff2HtmlCss = fs.readFileSync(path.join(diff2htmlResPath, 'ui', 'css', 'diff2html.css'), 'utf8');
const diff2HtmlJs = fs.readFileSync(path.join(diff2htmlResPath, 'ui', 'js', 'diff2html-ui.js'), 'utf8');


files.forEach(file => {

    const cachePath = path.join(cacheDir, file.replace(process.cwd(), '').replace(/\//g, '_').replace('.less', ''));
    const settingsFile = path.join(cachePath, '_settings.json');


    if (!useCache || !fs.existsSync(cachePath) || !fs.existsSync(settingsFile) || fs.readFileSync(settingsFile, 'utf8') !== settings) {
        const source = fs.readFileSync(file, 'utf8');
        const sourceConcat = template ? replaceLessSource(template.replace('$FILE', file)) : replaceLessSource(source);

        try {

            const mjss = less2mjss(sourceConcat, {staticFunctions, inline});

            const css: any = {};

            const sheet = new Sheet(lockOptions(), mjss);

            css.mjss = css_beautify(sheet.toString());

            less.render(source, {syncImport: true, ieCompat: false, relativeUrls: true}, (err, res) => {
                css.less = css_beautify(res.css);
            });

            mkpath.sync(cachePath);

            if (produceDiff) {
                const diffPatch = diff.createPatch(file, css.less, css.mjss, '', '');
                if(diffPatch.length > 8000) {

                    console.log('big diff', file);
                }
                fs.writeFileSync(path.join(cachePath, 'diff.html'), diffPage(diffPatch));
            }

            fs.writeFileSync(settingsFile, settings);
            fs.writeFileSync(path.join(cachePath, 'source.less'), sourceConcat);
            fs.writeFileSync(path.join(cachePath, 'less.css'), css.less);
            fs.writeFileSync(path.join(cachePath, 'mjss.css'), css.mjss);
            fs.writeFileSync(path.join(cachePath, 'mjss.json'), JSON.stringify(mjss, null, 2));


            console.log(file);

        } catch (e) {
            debugger;
            throw file;
        }

    }

});


function css_beautify(input) {
    return cssFormat(stripComments(input)).split('\n').filter(v => v.trim()).join('\n');
}

function diffPage(diff) {

    const body = Diff2Html.getPrettyHtml(diff);

    const regex = /-.*?color.*?:\s*(.*?);\n\+.*?color.*?:\s*(.*?);/g;
    let colorDiff;
    const colors = [];
    while(colorDiff = regex.exec(diff)) {
        colors.push({
            less: colorDiff[1],
            mjss: colorDiff[2]
        })
    }

    const colorTableHtml = colorTable(colors);

    return `<html>
    <head>
    <style>
        ${diff2HtmlCss}
        table {
            border-collapse: collapse;
        }
        th, td {
            padding: 0;
        }
    </style>

    <script>
    ${diff2HtmlJs}
    </script>

    </head>

    <body>
        ${body}
        ${colorTableHtml}
    </body>

    </html>`;

}

function colorTable(colors) {

    const tableContent = colors.map(color => {
        return `<tr>
        <td style="background-color:${color.less};">less</td>
        <td style="background-color:${color.mjss};">mjss</td>
        </tr>`
    }).join('\n');

    return colors.length && `
    <table style="width:100%">
    ${tableContent}
    </table>`;
}