import { JSONLineComponent, KeyedArray, LineComponent } from './Interfaces';
/**
 * Recursively maps the properties from one object onto another
 * @param object1 The object with the old properties
 * @param object2 The object with the new properties
 */
export declare const deepAssign: <T1 extends {
    [key: string]: any;
}, T2 extends {
    [key: string]: any;
}>(object1: T1, object2: T2) => T1 & T2;
/**
 * Gets a valid scoreboard name from a line
 * @param lineComponent The Line Component to get a name from
 * @param existingLines The existing lines containing names which cannot be used
 * @returns `[nameIndex, line]`, where the line is a parsed line component array and nameIndex the index of the name in the provided line component array
 */
export declare const getNameFromLine: (lineComponent: LineComponent | LineComponent[], existingNames: string[]) => [number, KeyedArray<Required<JSONLineComponent>>];
/**
 * Parses a Line Component into a JSONLineComponent
 * @param line The Line Component to parse
 * @returns A JSONLineComponent array with all properties being defined as necessary
 */
export declare const parseLineComponent: ((line: LineComponent) => Required<JSONLineComponent>[]);
/**
 * Tracks the differences between two objects
 * @param reference The reference for the second object
 * @param comparator The object which will be compared to the reference (first) object
 * @returns An object containing the keys/values which are different on the comparator (second) object compared to the reference (first) object
 */
export declare const trackDifferences: ((reference: {
    [key: string]: any;
}, comparator: {
    [key: string]: any;
}) => Partial<typeof comparator>);
