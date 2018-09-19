import * as Color from 'color';
// import Color from 'tinycolor2';
//
// Color.prototype.alpha = function(val = false) {

//     if (val === false) {
//         return this.getAlpha();
//     } else {
//         return this.setAlpha(val);
//     }
// };
// Color.prototype.hsl = Color.prototype.toHsl;
// Color.prototype.hex = Color.prototype.toHex;
// Color.prototype.rgb = Color.prototype.toRgb;
// Color.prototype.toLessString = function() {
//     return (this.alpha() < 1 ? this.toRgbString() : ('#' + this.hex()).toLowerCase());
// };

Color.prototype.toLessString = function() {
    return (this.alpha() < 1 ? this.rgb().toString() : this.hex().toLowerCase());
};

/**
 * a set of functions emulating the behaviour of lesscss (% will be assumed to be normalized to 0-1)
 */

/* [
    "darken",
    "fade",
    "lighten",
    "fadeout",
    "desaturate",
    "saturate",
     "spin",
     "mix"
]*/

export function darken(color, amount) {
    color = Color(color);

    // return color.darken(parseFloat(amount)).toLessString();

    // scale values by 100 to get a floating point error similar to less!
    // otherwise we get rounting errors
    color = color.hsl();
    color.color[2] = (color.color[2] / 100 - parseFloat(amount) / 100) * 100;

    return color.toLessString();
}

export function lighten(color, amount) {
    // color = CoClor(color);
    // return color.lighten(amount)
    return darken(color, `-${amount}`);
}

export function escape(input = '') {
    return encodeURI(input).replace(/=/g, '%3D').replace(/:/g, '%3A').replace(/#/g, '%23').replace(/;/g, '%3B')
            .replace(/\(/g, '%28').replace(/\)/g, '%29');
}

export function fade(color, amount) {
    color = Color(color);
    return color.alpha(parseFloat(amount) / 100).toLessString();
}

export function replace(string, pattern, replacement, flags = '') {
    return string.replace(new RegExp(pattern, flags), replacement);
}

export function fadeout(color, amount) {
    color = Color(color);

    amount = parseFloat(amount) / 100;
    color = color.alpha(color.alpha() - amount);

    return color.toLessString();
}

export function saturate(color, amount) {
    color = Color(color).hsl();

    color.color[1] += parseFloat(amount);

    return color.toLessString();
}

export function dataUri(mimetype, filePath) {

    return mimetype + filePath;
}

export function desaturate(color, amount) {
    return saturate(color, `-${amount}`);
}

export function spin(color, amount) {
    color = Color(color);
    return color.rotate(parseFloat(amount)).toLessString();
}

export function floor(val) {
    return Math.floor(val) + (val.unit || '');
}
export function round(val) {
    return Math.round(val) + (val.unit || '');
}

export function e(arg) {
    return arg && arg.replace(/"/g, '') || '';
}

export function tint(color, amount) {
    return mix(Color({r: 255, g: 255, b: 255}), Color(color), parseFloat(amount));
}

export function mix(color, color2, amount = '50%') {
    color = Color(color);
    color2 = Color(color2);
    // debugger
    return color2.mix(color, parseFloat(amount) / 100).toLessString();
    // return Color.mix(color2, color, parseFloat(amount)).toLessString();
}

// floor.passUnits = true;
// round.passUnits = true;

// export functions with mapping
export default {
    tint,
    round,
    floor,
    e,
    'data-uri': dataUri,
    darken,
    lighten,
    fadeout,
    fade,
    desaturate,
    saturate,
    spin,
    mix,
    escape,
    replace
};
