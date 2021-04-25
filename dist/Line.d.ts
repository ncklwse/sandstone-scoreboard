import { BASIC_COLORS } from 'sandstone';
interface customJSONTextComponent {
    text: string;
    color?: BASIC_COLORS;
}
export declare class Line {
    private static instances;
    private index;
    private updateListeners;
    private rawData;
    constructor(line: customJSONTextComponent | customJSONTextComponent[]);
    update(line: customJSONTextComponent | customJSONTextComponent[]): void;
    _getId(): number;
    _getRawData(): customJSONTextComponent[];
    _onUpdate(fn: ((cancelListener: (() => void)) => void)): void;
    _triggerUpdate(): void;
}
export {};
