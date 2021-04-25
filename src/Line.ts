import { BASIC_COLORS } from 'sandstone';

interface customJSONTextComponent {
    text: string,
    color?: BASIC_COLORS
}

export class Line {

    private static instances: Line[] = [];

    private index: number;
    private updateListeners: ((cancelListener: (() => void)) => void)[] = [];
    private rawData: customJSONTextComponent[];

    /**
     * @param line A custom JSONTextComponent containing the text information for the initial line value
     */
    constructor(line: customJSONTextComponent | customJSONTextComponent[]) {
        this.index = Line.instances.length;
        this.rawData = (line instanceof Array) ? line : [line];
        Line.instances.push(this);
    }

    /**
     * Updates the line value (across all scoreboards)
     * @param line A custom JSONTextComponent containing the text information for the updated line value
     */
    update(line: customJSONTextComponent | customJSONTextComponent[]) {
        this.rawData = (line instanceof Array) ? line : [line];
        this._triggerUpdate();
    }

    /**
     * @deprecated
     * @ignore
     * @internal 
     * @hidden
     */
    _getId() {
        return this.index;
    }

    /**
     * @deprecated
     * @ignore
     * @internal 
     * @hidden
     */
    _getRawData() {
        return this.rawData;
    }

    /**
     * @deprecated
     * @ignore
     * @internal 
     * @hidden
     */
    _onUpdate(fn: ((cancelListener: (() => void)) => void)) {
        this.updateListeners.push(fn);
        
    }

    /**
     * @deprecated
     * @ignore
     * @internal 
     * @hidden
     */
    _triggerUpdate() {
        
        const toRemove: number[] = [];
        this.updateListeners.forEach((fn, index) => {
            fn(() => {
                toRemove.push(index);
            });
        });

        this.updateListeners = this.updateListeners.filter((_item, index) => toRemove.indexOf(index) === -1);

    }

}