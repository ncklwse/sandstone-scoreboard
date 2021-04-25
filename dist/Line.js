"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Line = void 0;
class Line {
    constructor(line) {
        this.updateListeners = [];
        this.index = Line.instances.length;
        this.rawData = (line instanceof Array) ? line : [line];
        Line.instances.push(this);
    }
    update(line) {
        this.rawData = (line instanceof Array) ? line : [line];
        this._triggerUpdate();
    }
    _getId() {
        return this.index;
    }
    _getRawData() {
        return this.rawData;
    }
    _onUpdate(fn) {
        this.updateListeners.push(fn);
    }
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
