// import * as Color from 'color';
import * as Color from 'tinycolor2';

function ColorImmutable(input) {
    // performance hack to ensure immutable colors
    return Color(input instanceof Object ? input.toString() : input);
}

Color.prototype.toString = function() {
    return (this.getAlpha() < 1 ? this.toRgbString() : ('#' + this.toHex()).toLowerCase());
};

/**
 * a set of functions emulating the behaviour of lesscss
 */

export function darken(color, amount) {
    return ColorImmutable(color).darken(parseFloat(amount));
}

export function lighten(color, amount) {
    return ColorImmutable(color).lighten(parseFloat(amount));
}

export function fadeout(color, amount) {
    color = ColorImmutable(color);

    amount = parseFloat(amount) / 100;
    color = color.setAlpha(color.getAlpha() - amount);

    return color;
}

export function saturate(color, amount) {

    amount = parseFloat(amount);

    return ColorImmutable(color).saturate(amount);
}

export function desaturate(color, amount) {
    return saturate(color, `-${amount}`);
}

export function spin(color, amount) {
    return ColorImmutable(color).spin(parseFloat(amount));
}

export function tint(color, amount) {
    return mix(Color({r: 255, g: 255, b: 255}), ColorImmutable(color), amount);
}

export function mix(color, color2, amount = '50%') {
    return Color.mix(ColorImmutable(color2), ColorImmutable(color), parseFloat(amount)-0.0001);
}

export function fade(color, amount) {
    return ColorImmutable(color).setAlpha(parseFloat(amount) / 100);
}



export function dataUri(mimetype, filePath) {
    return mimetype + filePath;
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

export function escape(input = '') {
    return encodeURI(input).replace(/=/g, '%3D').replace(/:/g, '%3A').replace(/#/g, '%23').replace(/;/g, '%3B')
            .replace(/\(/g, '%28').replace(/\)/g, '%29');
}

export function replace(string, pattern, replacement, flags = '') {
    return string.replace(new RegExp(pattern, flags), replacement);
}

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
