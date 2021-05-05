"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLineComponent = void 0;
const parseLineComponent = (line) => {
    var _a, _b, _c, _d, _e, _f;
    if (typeof line !== 'object') {
        return [{
                bold: false,
                color: 'white',
                italics: false,
                obfuscated: false,
                strikethrough: false,
                text: line.toString(),
                underlined: false
            }];
    }
    if (!(line instanceof Array)) {
        return [{
                bold: (_a = line.bold) !== null && _a !== void 0 ? _a : false,
                color: (_b = line.color) !== null && _b !== void 0 ? _b : 'white',
                italics: (_c = line.italics) !== null && _c !== void 0 ? _c : false,
                obfuscated: (_d = line.obfuscated) !== null && _d !== void 0 ? _d : false,
                strikethrough: (_e = line.strikethrough) !== null && _e !== void 0 ? _e : false,
                text: line.text,
                underlined: (_f = line.underlined) !== null && _f !== void 0 ? _f : false
            }];
    }
    return line.reduce((reduced, current) => reduced.concat(exports.parseLineComponent(current)), []);
};
exports.parseLineComponent = parseLineComponent;
