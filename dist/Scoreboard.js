"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scoreboard = void 0;
const chalk_1 = __importDefault(require("chalk"));
const sandstone_1 = require("sandstone");
const init_1 = require("sandstone/init");
const Animations_1 = require("./Animations");
const Utils_1 = require("./Utils");
class Scoreboard {
    /**
     * @param display The LineComponent containing the text information for the default scoreboard display
     */
    constructor(display) {
        this.lineAnimations = {};
        this.lineNames = [];
        this.lineScoreToRemove = sandstone_1.Variable(-1);
        this.renderCommands = [];
        this.renderQueue = {};
        this.index = Scoreboard.instances.length;
        this.state = { animated: false, display: '', initialized: false, lines: [], visibility: {} };
        this.animations = new Animations_1.Animations(this.index, 'objective', (keyframe) => {
            sandstone_1.scoreboard.objectives.modify(`sb_${init_1.dataPack.packUid}_${this.index}`, 'displayname', keyframe.display);
        });
        this.render({
            initialized: true,
            display: display,
            lines: []
        });
        init_1.dataPack.initCommands.push(['function', `${init_1.dataPack.defaultNamespace}:__scoreboards__/${this.index}/init`]);
        Scoreboard.instances.push(this);
    }
    /**
     * Renders a new scoreboard state based on previously rendered scoreboard states
     * @param newState The new (partial) state to render
     */
    render(newState) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2;
        this.renderQueue = Utils_1.deepAssign(this.renderQueue, Utils_1.trackDifferences(this.state, newState));
        // Add scoreboard if initialized
        if (this.renderQueue.initialized === true && typeof this.renderQueue.display !== undefined) {
            this.renderCommands.push(`scoreboard objectives remove sb_${init_1.dataPack.packUid}_${this.index}`);
            this.renderCommands.push(`scoreboard objectives add sb_${init_1.dataPack.packUid}_${this.index} dummy ${JSON.stringify(this.renderQueue.display)}`);
        }
        // Remove scoreboard if not initialized
        if (this.renderQueue.initialized === false) {
            this.renderCommands.push(`scoreboard objectives remove sb_${init_1.dataPack.packUid}_${this.index}`);
        }
        // Change scoreboard displayname and stop animations if necessary
        if (typeof this.renderQueue.initialized === undefined && typeof this.renderQueue.display !== undefined) {
            this.renderCommands.push(`scoreboard objectives modify sb_${init_1.dataPack.packUid}_${this.index} displayname ${JSON.stringify(this.renderQueue.display)}`);
            if (this.state.animated) {
                this.renderQueue.animated = false;
            }
        }
        // Loop through lines if necessary (second condition is to fix type error)
        if (typeof this.renderQueue.lines !== 'undefined' && typeof this.state.lines !== 'undefined') {
            for (const [i, line] of Object.entries(this.renderQueue.lines)) {
                // Reset "player" if score is negative
                if (typeof line.score !== 'undefined' && line.score < 0) {
                    this.renderCommands.push(`scoreboard players reset ${((_a = line.display) !== null && _a !== void 0 ? _a : this.state.lines[Number(i)].display)[(_b = line.nameIndex) !== null && _b !== void 0 ? _b : this.state.lines[Number(i)].nameIndex].text} sb_${init_1.dataPack.packUid}_${this.index}`);
                }
                // Add team if it doesn't exist
                if (typeof line.display !== 'undefined' && typeof line.nameIndex !== 'undefined' && typeof line.score !== 'undefined') {
                    this.renderCommands.push(`team add sb_${init_1.dataPack.packUid}_${this.index}_${i}`);
                    this.renderCommands.push(`team join sb_${init_1.dataPack.packUid}_${this.index}_${i} ${((_c = line.display) !== null && _c !== void 0 ? _c : this.state.lines[Number(i)].display)[(_d = line.nameIndex) !== null && _d !== void 0 ? _d : this.state.lines[Number(i)].nameIndex].text}`);
                }
                // Modify team properties if the display or name index changed
                if (typeof line.display !== 'undefined' || typeof line.nameIndex !== 'undefined') {
                    // Modify color if changed
                    if (typeof ((_g = (_e = line.display) === null || _e === void 0 ? void 0 : _e[(_f = line.nameIndex) !== null && _f !== void 0 ? _f : this.state.lines[Number(i)].nameIndex]) === null || _g === void 0 ? void 0 : _g.color) !== 'undefined') {
                        this.renderCommands.push(`team modify sb_${init_1.dataPack.packUid}_${this.index}_${i} color ${(_h = line.display) === null || _h === void 0 ? void 0 : _h[(_j = line.nameIndex) !== null && _j !== void 0 ? _j : this.state.lines[Number(i)].nameIndex].color}`);
                    }
                    // Modify prefix and suffix
                    this.renderCommands.push(`team modify sb_${init_1.dataPack.packUid}_${this.index}_${i} prefix ${JSON.stringify(Object.values({ ...(_k = this.state.lines[Number(i)]) === null || _k === void 0 ? void 0 : _k.display, ...line.display }).slice(0, (_l = line.nameIndex) !== null && _l !== void 0 ? _l : this.state.lines[Number(i)].nameIndex))}`);
                    this.renderCommands.push(`team modify sb_${init_1.dataPack.packUid}_${this.index}_${i} suffix ${JSON.stringify(Object.values({ ...(_m = this.state.lines[Number(i)]) === null || _m === void 0 ? void 0 : _m.display, ...line.display }).slice(((_o = line.nameIndex) !== null && _o !== void 0 ? _o : this.state.lines[Number(i)].nameIndex) + 1))}`);
                }
                // Remove and re-add scoreboard player if changed
                if (typeof ((_r = (_p = line.display) === null || _p === void 0 ? void 0 : _p[(_q = line.nameIndex) !== null && _q !== void 0 ? _q : this.state.lines[Number(i)].nameIndex]) === null || _r === void 0 ? void 0 : _r.text) !== 'undefined' && Number(i) in this.state.lines && !!init_1.dataPack.currentFunction && init_1.dataPack.currentFunction.isResource) {
                    this.renderCommands.push(`scoreboard players set ${this.lineScoreToRemove.target} ${this.lineScoreToRemove.objective} ${(_s = line.score) !== null && _s !== void 0 ? _s : this.state.lines[Number(i)].score}`);
                    this.renderCommands.push(`function ${init_1.dataPack.defaultNamespace}:__scoreboards__/${this.index}/remove_lines`);
                    this.renderCommands.push(`scoreboard players set ${line.display[(_t = line.nameIndex) !== null && _t !== void 0 ? _t : this.state.lines[Number(i)].nameIndex].text} sb_${init_1.dataPack.packUid}_${this.index} ${this.state.lines[Number(i)].score}`);
                    this.renderCommands.push(`team join sb_${init_1.dataPack.packUid}_${this.index}_${i} ${((_u = line.display) !== null && _u !== void 0 ? _u : this.state.lines[Number(i)].display)[(_v = line.nameIndex) !== null && _v !== void 0 ? _v : this.state.lines[Number(i)].nameIndex].text}`);
                    this.lineNames.push(line.display[(_w = line.nameIndex) !== null && _w !== void 0 ? _w : this.state.lines[Number(i)].nameIndex].text);
                }
                // Set score if the score changed
                if (typeof line.score !== 'undefined') {
                    this.renderCommands.push(`scoreboard players set ${((_x = line.display) !== null && _x !== void 0 ? _x : this.state.lines[Number(i)].display)[(_y = line.nameIndex) !== null && _y !== void 0 ? _y : this.state.lines[Number(i)].nameIndex].text} sb_${init_1.dataPack.packUid}_${this.index} ${line.score}`);
                }
                // Animate line if necessary
                if (typeof line.animated !== 'undefined' && line.animated) {
                    this.renderCommands.push(`function ${init_1.dataPack.defaultNamespace}:__scoreboards__/${this.index}/animations/lines/${i}`);
                }
                // Stop animations if specified
                if (((_0 = (_z = newState.lines) === null || _z === void 0 ? void 0 : _z[Number(i)]) === null || _0 === void 0 ? void 0 : _0.animated) === false) {
                    this.renderCommands.push(`schedule clear ${init_1.dataPack.defaultNamespace}:__scoreboards__/${this.index}/animations/lines/${i}`);
                }
            }
        }
        // Loop through visibility states if necessary
        if (typeof this.renderQueue.visibility !== 'undefined') {
            for (const [slot, visible] of Object.entries(this.renderQueue.visibility)) {
                if (typeof visible === 'undefined') {
                    continue;
                }
                if (visible && !(slot in Scoreboard.visibility)) {
                    this.renderCommands.push(`scoreboard objectives setdisplay ${slot} sb_${init_1.dataPack.packUid}_${this.index}`);
                    Scoreboard.visibility[slot] = sandstone_1.Variable(this.index);
                }
                if (visible && this.state.visibility[(slot !== null && slot !== void 0 ? slot : 'sidebar')] === false) {
                    this.renderCommands.push(`scoreboard objectives setdisplay ${slot} sb_${init_1.dataPack.packUid}_${this.index}`);
                    (_1 = Scoreboard.visibility[slot]) === null || _1 === void 0 ? void 0 : _1.set(this.index);
                }
                if (!visible && this.state.visibility[(slot !== null && slot !== void 0 ? slot : 'sidebar')] === true) {
                    this.renderCommands.push(`scoreboard objectives setdisplay ${slot}`);
                    (_2 = Scoreboard.visibility[slot]) === null || _2 === void 0 ? void 0 : _2.set(-1);
                }
            }
        }
        // Animate objective if necessary
        if (typeof this.renderQueue.animated !== 'undefined') {
            if (this.renderQueue.animated) {
                this.renderCommands.push(`function ${init_1.dataPack.defaultNamespace}:__scoreboards__/${this.index}/animations/objective`);
            }
            if (!this.renderQueue.animated) {
                this.renderCommands.push(`schedule clear ${init_1.dataPack.defaultNamespace}:__scoreboards__/${this.index}/animations/objective`);
            }
        }
        // Update basic scoreboard states
        this.state = Utils_1.deepAssign(this.state, newState);
        const createRenderFn = (commands) => {
            commands = [...commands];
            return () => {
                commands.forEach(cmd => {
                    sandstone_1.raw(cmd);
                });
                this.renderQueue = {};
            };
        };
        // Render stuff now if we're in a function
        if (!!init_1.dataPack.currentFunction && !!init_1.dataPack.currentFunction.isResource) {
            createRenderFn(this.renderCommands)();
        }
        // Run rendering code on init if we aren't in a function
        if (!init_1.dataPack.currentFunction || !init_1.dataPack.currentFunction.isResource) {
            sandstone_1.MCFunction(`__scoreboards__/${this.index}/init`, createRenderFn(this.renderCommands), { onConflict: 'replace' });
        }
        sandstone_1.MCFunction(`__scoreboards__/${this.index}/remove_lines`, () => {
            this.lineNames.filter((lineName, i) => {
                if (this.lineNames.indexOf(lineName) !== i) {
                    return false;
                }
                sandstone_1.raw(`execute if score ${this.lineScoreToRemove.target} ${this.lineScoreToRemove.objective} = ${lineName} sb_${init_1.dataPack.packUid}_${this.index} run scoreboard players reset ${lineName} sb_${init_1.dataPack.packUid}_${this.index}`);
                return true;
            });
        }, { onConflict: 'replace' });
        this.renderCommands = [];
    }
    /**
     * Adds a line to the scoreboard
     * @param lineComponent The LineComponent to add to the scoreboard
     * @param priority The priority for how high up your line appears in the scoreboard; defaults to 0
     * @returns An interface for modifying the line
     */
    addLine(lineComponent, priority) {
        const [initialNameIndex, initialLine] = Utils_1.getNameFromLine(lineComponent, this.lineNames);
        const index = Object.keys(this.state.lines).length;
        const maxPriority = Object.entries(this.state.lines).reduce((p, c) => Math.max(p, c[1].score), -1) + 1;
        const scoreboard = this;
        if (typeof priority !== 'undefined' && priority < 0) {
            throw new Error('Line priority must be greator than 0');
        }
        this.lineNames.push(initialLine[initialNameIndex].text);
        this.render({
            lines: {
                ...Object.entries(this.state.lines).map(([i, line]) => [i, {
                        animated: line.animated,
                        display: line.display,
                        nameIndex: line.nameIndex,
                        score: (line.score >= (priority !== null && priority !== void 0 ? priority : 0)) ? line.score + 1 : line.score
                    }]).reduce((reduced, [i, line]) => ({
                    ...reduced,
                    [i]: { ...line }
                }), {}),
                [index]: {
                    animated: false,
                    display: initialLine,
                    nameIndex: initialNameIndex,
                    score: ((priority !== null && priority !== void 0 ? priority : 0) > maxPriority) ? maxPriority : (priority !== null && priority !== void 0 ? priority : 0)
                }
            }
        });
        return {
            /**
             * Animates the scoreboard line
             * @param keyframes The array of Keyframes to animate through
             */
            animate(keyframes) {
                if (!(index in scoreboard.lineAnimations)) {
                    scoreboard.lineAnimations[index] = new Animations_1.Animations(scoreboard.index, `lines/${index}`, (keyframe) => {
                        this.setText(keyframe.display);
                    });
                }
                scoreboard.lineAnimations[index].animate(keyframes);
                scoreboard.render({
                    lines: {
                        [index]: {
                            animated: true,
                            display: scoreboard.state.lines[index].display,
                            nameIndex: scoreboard.state.lines[index].nameIndex,
                            score: scoreboard.state.lines[index].score
                        }
                    }
                });
            },
            /**
             * Resets the line to its initial value
             */
            reset() {
                scoreboard.render({
                    lines: {
                        [index]: {
                            animated: false,
                            display: initialLine,
                            nameIndex: initialNameIndex,
                            score: scoreboard.state.lines[index].score
                        }
                    }
                });
            },
            /**
             * Sets the text of the line
             * @param lineComponent The new LineComponent to replace the old one
             */
            setText(lineComponent) {
                const [newNameIndex, newLine] = Utils_1.getNameFromLine(lineComponent, scoreboard.lineNames);
                scoreboard.render({
                    lines: {
                        [index]: {
                            animated: false,
                            display: newLine,
                            nameIndex: newNameIndex,
                            score: scoreboard.state.lines[index].score
                        }
                    }
                });
            }
        };
    }
    /**
     * Animates the scoreboard display
     * @param keyframes The array of Keyframes to animate through
     */
    animate(keyframes) {
        this.animations.animate(keyframes);
        this.render({
            animated: true
        });
    }
    /**
     * Hides the scoreboard
     * @param displaySlot The display slot to show the scoreboard to; defaults to all display slots
     */
    hide(displaySlot) {
        this.render({
            visibility: (displaySlot instanceof Array ? displaySlot : [displaySlot !== null && displaySlot !== void 0 ? displaySlot : 'sidebar']).reduce((reduced, current) => ({
                ...reduced,
                [current]: false
            }), {})
        });
    }
    /**
     * Sets the text of the scoreboard display; stops any currently running animations
     * @param display The LineComponent containing the text information for the new scoreboard display
     */
    setText(display) {
        this.render({ display });
    }
    /**
     * Shows the scoreboard
     * @param displaySlot The display slot to show the scoreboard to; defaults to 'sidebar', or all players/teams
     */
    show(displaySlot) {
        if (Object.values(this.state.lines).length < 1) {
            console.warn(chalk_1.default.keyword('orange')('Warning: Your scoreboard might not show because you haven\'t added any lines to it yet.'));
        }
        this.render({
            visibility: (displaySlot instanceof Array ? displaySlot : [displaySlot !== null && displaySlot !== void 0 ? displaySlot : 'sidebar']).reduce((reduced, current) => ({
                ...reduced,
                [current]: true
            }), {})
        });
    }
}
exports.Scoreboard = Scoreboard;
Scoreboard.instances = [];
Scoreboard.visibility = {};
