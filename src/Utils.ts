import chalk from 'chalk';
import { JSONLineComponent, KeyedArray, LineComponent } from './Interfaces';

/**
 * Recursively maps the properties from one object onto another
 * @param object1 The object with the old properties
 * @param object2 The object with the new properties
 */
export const deepAssign: <T1 extends {[key: string]: any}, T2 extends {[key: string]: any}>(object1: T1, object2: T2) => T1 & T2 = (object1, object2) => {

    const shallowAssign = {...object1, ...object2};

    for (const key in shallowAssign) {
        if (typeof object1[key] === 'object' && typeof object2[key] === 'object') {
            shallowAssign[key as keyof typeof shallowAssign] = deepAssign(object1[key], object2[key]);
        }
    }

    return shallowAssign;

}

/**
 * Gets a valid scoreboard name from a line
 * @param lineComponent The Line Component to get a name from
 * @param existingLines The existing lines containing names which cannot be used
 * @returns `[nameIndex, line]`, where the line is a parsed line component array and nameIndex the index of the name in the provided line component array
 */
export const getNameFromLine = (lineComponent: LineComponent | LineComponent[], existingNames: string[]) => {
    
    let line = parseLineComponent(lineComponent);    
    let nameIndex: number = 0;
    let positionInName: [number, number] = [0, 1];
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
                positionInName = [relativePositionInName[0] + (name.index ?? 0), relativePositionInName[1] + (name.index ?? 0)];
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
        console.warn(chalk.keyword('orange')('Warning: Using bold, italics, obfuscated, strikethrough, and underlined on scoreboard lines formatting options might not appear as expected, as they are not officially supported in Minecraft.'));
    }

    return [nameIndex, {...line}] as [number, KeyedArray<Required<JSONLineComponent>>];

}

/**
 * Parses a Line Component into a JSONLineComponent
 * @param line The Line Component to parse
 * @returns A JSONLineComponent array with all properties being defined as necessary
 */
export const parseLineComponent: ((line: LineComponent) => Required<JSONLineComponent>[]) = (line) => {
    
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
            bold: line.bold ?? false,
            color: line.color ?? 'white',
            italics: line.italics ?? false,
            obfuscated: line.obfuscated ?? false,
            strikethrough: line.strikethrough ?? false,
            text: line.text,
            underlined: line.underlined ?? false
        }];
    }

    return line.reduce((reduced: Required<JSONLineComponent>[], current) => reduced.concat(parseLineComponent(current)), []);

}

/**
 * Tracks the differences between two objects
 * @param reference The reference for the second object
 * @param comparator The object which will be compared to the reference (first) object
 * @returns An object containing the keys/values which are different on the comparator (second) object compared to the reference (first) object
 */
export const trackDifferences: ((reference: {[key: string]: any}, comparator: {[key: string]: any }) => Partial<typeof comparator>) = (reference, comparator) => {
    
    const differences: {[key: string]: any} = {};

    for (const key of Object.keys(comparator)) {

        if (reference[key] instanceof Array && comparator[key] instanceof Array) {
            reference = {...reference, [key]: {...reference[key]}};
            comparator = {...comparator, [key]: {...comparator[key]}};
        }

        if (typeof reference[key] === 'object' && typeof comparator[key] === 'object') {
            
            const subDifferences = trackDifferences(reference[key], comparator[key]);
            
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

}