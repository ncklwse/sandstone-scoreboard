"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackDifferences = exports.parseLineComponent = exports.getNameFromLine = exports.deepAssign = void 0;
const chalk_1 = __importDefault(require("chalk"));
/**
 * Recursively maps the properties from one object onto another
 * @param object1 The object with the old properties
 * @param object2 The object with the new properties
 */
const deepAssign = (object1, object2) => {
    const shallowAssign = { ...object1, ...object2 };
    for (const key in shallowAssign) {
        if (typeof object1[key] === 'object' && typeof object2[key] === 'object') {
            shallowAssign[key] = exports.deepAssign(object1[key], object2[key]);
        }
    }
    return shallowAssign;
};
exports.deepAssign = deepAssign;
/**
 * Gets a valid scoreboard name from a line
 * @param lineComponent The Line Component to get a name from
 * @param existingLines The existing lines containing names which cannot be used
 * @returns `[nameIndex, line]`, where the line is a parsed line component array and nameIndex the index of the name in the provided line component array
 */
const getNameFromLine = (lineComponent, existingNames) => {
    var _a, _b;
    let line = exports.parseLineComponent(lineComponent);
    let nameIndex = 0;
    let positionInName = [0, 1];
    let foundValidName = false;
    for (const i in line) {
        const possibleNames = [...(line[i].text.matchAll(/[^ \*]+/g))];
        nameIndex = Number(i);
        for (const name of possibleNames) {
            let relativePositionInName = [0, name[0].length];
            while (true) {
                if (!existingNames.includes(name[0].substring(relativePositionInName[0], relativePositionInName[1]))) {
                    foundValidName = true;
                    break;
                }
                relativePositionInName[0]++;
                if (relativePositionInName[0] === relativePositionInName[1]) {
                    relativePositionInName[0] = 0;
                    relativePositionInName[1]--;
                }
                if (relativePositionInName[1] === 0) {
                    break;
                }
            }
            if (foundValidName) {
                positionInName = [relativePositionInName[0] + ((_a = name.index) !== null && _a !== void 0 ? _a : 0), relativePositionInName[1] + ((_b = name.index) !== null && _b !== void 0 ? _b : 0)];
                break;
            }
        }
        if (foundValidName) {
            break;
        }
    }
    if (!foundValidName) {
        throw new Error('Could not find a valid player name in the provided line.');
    }
    line = [...line.slice(0, nameIndex), ...([{
                ...line[nameIndex],
                text: line[nameIndex].text.substring(0, positionInName[0])
            }, {
                ...line[nameIndex],
                text: line[nameIndex].text.substring(positionInName[0], positionInName[1])
            }, {
                ...line[nameIndex],
                text: line[nameIndex].text.substring(positionInName[1])
            }]), ...line.slice(nameIndex + 1)];
    nameIndex++;
    if (line[nameIndex].bold || line[nameIndex].italics || line[nameIndex].obfuscated || line[nameIndex].strikethrough || line[nameIndex].underlined) {
        console.warn(chalk_1.default.keyword('orange')('Warning: Using bold, italics, obfuscated, strikethrough, and underlined on scoreboard lines formatting options might not appear as expected, as they are not officially supported in Minecraft.'));
    }
    return [nameIndex, { ...line }];
};
exports.getNameFromLine = getNameFromLine;
/**
 * Parses a Line Component into a JSONLineComponent
 * @param line The Line Component to parse
 * @returns A JSONLineComponent array with all properties being defined as necessary
 */
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
/**
 * Tracks the differences between two objects
 * @param reference The reference for the second object
 * @param comparator The object which will be compared to the reference (first) object
 * @returns An object containing the keys/values which are different on the comparator (second) object compared to the reference (first) object
 */
const trackDifferences = (reference, comparator) => {
    const differences = {};
    for (const key of Object.keys(comparator)) {
        if (reference[key] instanceof Array && comparator[key] instanceof Array) {
            reference = { ...reference, [key]: { ...reference[key] } };
            comparator = { ...comparator, [key]: { ...comparator[key] } };
        }
        if (typeof reference[key] === 'object' && typeof comparator[key] === 'object') {
            const subDifferences = exports.trackDifferences(reference[key], comparator[key]);
            if (Object.keys(subDifferences).length === 0) {
                continue;
            }
            differences[key] = subDifferences;
            continue;
        }
        if (reference[key] === comparator[key]) {
            continue;
        }
        differences[key] = comparator[key];
    }
    return differences;
};
exports.trackDifferences = trackDifferences;
