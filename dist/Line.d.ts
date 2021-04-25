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
    /**
     * @param line A custom JSONTextComponent containing the text information for the initial line value
     */
    constructor(line: customJSONTextComponent | customJSONTextComponent[]);
    /**
     * Updates the line value (across all scoreboards)
     * @param line A custom JSONTextComponent containing the text information for the updated line value
     */
    update(line: customJSONTextComponent | customJSONTextComponent[]): void;
    /**
     * @deprecated
     * @ignore
     * @internal
     * @hidden
     */
    _getId(): number;
    /**
     * @deprecated
     * @ignore
     * @internal
     * @hidden
     */
    _getRawData(): customJSONTextComponent[];
    /**
     * @deprecated
     * @ignore
     * @internal
     * @hidden
     */
    _onUpdate(fn: ((cancelListener: (() => void)) => void)): void;
    /**
     * @deprecated
     * @ignore
     * @internal
     * @hidden
     */
    _triggerUpdate(): void;
}
export {};
