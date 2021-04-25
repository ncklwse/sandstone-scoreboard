"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Line = void 0;
class Line {
    /**
     * @param line A custom JSONTextComponent containing the text information for the initial line value
     */
    constructor(line) {
        this.updateListeners = [];
        this.index = Line.instances.length;
        this.rawData = (line instanceof Array) ? line : [line];
        Line.instances.push(this);
    }
    /**
     * Updates the line value (across all scoreboards)
     * @param line A custom JSONTextComponent containing the text information for the updated line value
     */
    update(line) {
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
    _onUpdate(fn) {
        this.updateListeners.push(fn);
    }
    /**
     * @deprecated
     * @ignore
     * @internal
     * @hidden
     */
    _triggerUpdate() {
        const toRemove = [];
        this.updateListeners.forEach((fn, index) => {
            fn(() => {
                toRemove.push(index);
            });
        });
        this.updateListeners = this.updateListeners.filter((_item, index) => toRemove.indexOf(index) === -1);
    }
}
exports.Line = Line;
Line.instances = [];
