import { BASIC_COLORS } from 'sandstone';
export interface JSONLineComponent {
    bold?: boolean;
    color?: BASIC_COLORS;
    italics?: boolean;
    obfuscated?: boolean;
    strikethrough?: boolean;
    text: string;
    underlined?: boolean;
}
export declare type LineComponent = string | number | boolean | JSONLineComponent | LineComponent[];
export declare const parseLineComponent: ((line: LineComponent) => Required<JSONLineComponent>[]);
