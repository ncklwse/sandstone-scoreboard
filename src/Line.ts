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

    constructor(line: customJSONTextComponent | customJSONTextComponent[]) {
        this.index = Line.instances.length;
        this.rawData = (line instanceof Array) ? line : [line];
        Line.instances.push(this);
    }

    update(line: customJSONTextComponent | customJSONTextComponent[]) {
        this.rawData = (line instanceof Array) ? line : [line];
        this._triggerUpdate();
    }

    _getId() {
        return this.index;
    }
        
    _getRawData() {
        return this.rawData;
    }

    _onUpdate(fn: ((cancelListener: (() => void)) => void)) {
        this.updateListeners.push(fn);
        
    }

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