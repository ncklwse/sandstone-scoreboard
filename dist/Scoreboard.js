"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scoreboard = void 0;
const sandstone_1 = require("sandstone");
const init_1 = require("sandstone/init");
const chalk = __importStar(require("chalk"));
class Scoreboard {
    /**
     * @param displayName A JSONTextComponent containing the text information for the default scoreboard display
     */
    constructor(displayName) {
        this.animated = false;
        this.animationState = sandstone_1.Variable(0);
        this.lines = {};
        this.initialized = false;
        this.displayName = displayName;
        this.index = Object.keys(Scoreboard.instances).length;
        this.objectiveName = `anon_${init_1.dataPack.packUid}_${this.index}`;
        Scoreboard.instances.push(this);
    }
    addRawLine(line, priority) {
        const [nameIndex, parsedLine] = this.parseRawLine(line);
        Object.keys(this.lines).forEach(key => {
            if (this.lines[key].score >= (priority !== null && priority !== void 0 ? priority : 0))
                this.lines[key].score++;
        });
        this.lines[parsedLine[nameIndex].text] = {
            line: parsedLine,
            nameIndex: nameIndex,
            score: (priority !== undefined ? priority > Object.keys(this.lines).length ? Object.keys(this.lines).length : priority : 0)
        };
        return parsedLine[nameIndex].text;
    }
    parseRawLine(line) {
        var _a, _b, _c, _d, _e;
        if (!(line instanceof Array))
            line = [line];
        let nameIndex = 0;
        let positionInName = [0, 1];
        let foundValidName = false;
        for (const i in line) {
            const possibleNames = [...(line[i].text.matchAll(/[^ \*]+/g))];
            nameIndex = Number(i);
            for (const name of possibleNames) {
                let relativePositionInName = [0, name[0].length];
                while (true) {
                    if (!(name[0].substring(relativePositionInName[0], relativePositionInName[1]) in this.lines)) {
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
                    positionInName = [relativePositionInName[0] + ((_a = name.index) !== null && _a !== void 0 ? _a : 0), relativePositionInName[1] + ((_b = name.index) !== null && _b !== void 0 ? _b : 0)];
                    break;
                }
            }
            if (foundValidName) {
                break;
            }
        }
        if (!foundValidName) {
            throw new Error('Could not find a valid name in the provided string.');
        }
        line = [...line.slice(0, nameIndex), ...([{
                    text: line[nameIndex].text.substring(0, positionInName[0]),
                    color: (_c = line[nameIndex].color) !== null && _c !== void 0 ? _c : 'white'
                }, {
                    text: line[nameIndex].text.substring(positionInName[0], positionInName[1]),
                    color: (_d = line[nameIndex].color) !== null && _d !== void 0 ? _d : 'white'
                }, {
                    text: line[nameIndex].text.substring(positionInName[1]),
                    color: (_e = line[nameIndex].color) !== null && _e !== void 0 ? _e : 'white'
                }]), ...line.slice(nameIndex + 1)];
        nameIndex++;
        return [nameIndex, line];
    }
    ready() {
        if (!this.initialized) {
            this.initialized = true;
            sandstone_1.scoreboard.objectives.add(this.objectiveName, 'dummy', this.displayName);
        }
    }
    render() {
        var _a;
        this.ready();
        sandstone_1.scoreboard.players.reset('*', this.objectiveName);
        let generatedTeams = 0;
        for (const [name, { line, nameIndex, score }] of Object.entries(this.lines)) {
            sandstone_1.team.add(`anon_${init_1.dataPack.packUid}_${generatedTeams}`);
            sandstone_1.team.modify(`anon_${init_1.dataPack.packUid}_${generatedTeams}`, 'prefix', JSON.stringify(line.slice(0, nameIndex)));
            sandstone_1.team.modify(`anon_${init_1.dataPack.packUid}_${generatedTeams}`, 'color', (_a = line[nameIndex].color) !== null && _a !== void 0 ? _a : 'white');
            sandstone_1.team.modify(`anon_${init_1.dataPack.packUid}_${generatedTeams}`, 'suffix', JSON.stringify(line.slice(nameIndex + 1)));
            sandstone_1.team.join(`anon_${init_1.dataPack.packUid}_${generatedTeams}`, name);
            sandstone_1.scoreboard.players.set(name, this.objectiveName, score);
            generatedTeams++;
        }
    }
    /**
     * Adds a Line to the scoreboard
     * @param line The Line instance to add to the scoreboard
     * @param priority The priority for how high up your line appears in the scoreboard
     */
    addLine(line, priority) {
        let nameIndex = this.addRawLine(line._getRawData(), priority !== null && priority !== void 0 ? priority : 0);
        line._onUpdate((cancelListener) => {
            if (nameIndex in this.lines) {
                const [newNameIndex, parsedNewLine] = this.parseRawLine(line._getRawData());
                this.lines[parsedNewLine[newNameIndex].text] = {
                    line: parsedNewLine,
                    lineId: line._getId(),
                    nameIndex: newNameIndex,
                    score: this.lines[nameIndex].score
                };
                delete this.lines[nameIndex];
                if (!!init_1.dataPack.currentFunction && !!init_1.dataPack.currentFunction.isResource) {
                    this.render();
                }
            }
            else {
                cancelListener();
            }
        });
        this.lines[nameIndex].lineId = line._getId();
        if (!!init_1.dataPack.currentFunction && !!init_1.dataPack.currentFunction.isResource) {
            this.render();
        }
    }
    /**
     * Animates the scoreboard display through an array of specified keyframes
     * @param keyframes An array of JSONTextComponents with the added (optional) duration parameter, specified in ticks
     */
    animate(keyframes) {
        this.animated = true;
        sandstone_1.MCFunction(`custom_scoreboards/${this.index}/animate`, () => {
            init_1._.if(this.animationState.equalTo(keyframes.length), () => {
                this.animationState.set(0);
            });
            for (let i = keyframes.length - 1; i >= 0; i--) {
                init_1._.if(this.animationState.equalTo(i), () => {
                    var _a;
                    this.displayName = keyframes[i].display;
                    sandstone_1.scoreboard.objectives.modify(this.objectiveName, 'displayname', keyframes[i].display);
                    this.animationState.add(1);
                    sandstone_1.schedule.function(`${init_1.dataPack.defaultNamespace}:custom_scoreboards/${this.index}/animate`, (_a = keyframes[i].duration) !== null && _a !== void 0 ? _a : 20);
                });
            }
        }, { onConflict: 'replace' });
    }
    /**
     * Hides the scoreboard
     * @param teamColor The color of the team to hide the scoreboard from
     */
    hide(teamColor) {
        this.ready();
        sandstone_1.scoreboard.objectives.setDisplay((teamColor !== undefined) ? `sidebar.team.${teamColor}` : ('sidebar'));
        sandstone_1.scoreboard.objectives.remove(this.objectiveName);
        if (this.animated) {
            sandstone_1.schedule.clear(`${init_1.dataPack.defaultNamespace}:custom_scoreboards/${this.objectiveName}/animate`);
            this.animationState.set(0);
        }
    }
    /**
     * Removes all matching Line instances from the scoreboard
     * @param line The Line instance to remove from the scoreboard
     */
    removeLine(line) {
        const currentId = line._getId();
        Object.entries(this.lines).forEach(([nameIndex, storedLine]) => {
            if (storedLine.lineId === currentId) {
                delete this.lines[nameIndex];
            }
        });
        line._triggerUpdate();
        if (!!init_1.dataPack.currentFunction && !!init_1.dataPack.currentFunction.isResource) {
            this.render();
        }
    }
    /**
     * Shows the scoreboard
     * @param teamColor The color of the team to show the scoreboard to
     */
    show(teamColor) {
        if (Object.keys(this.lines).length === 0) {
            console.warn(chalk.keyword('orange')('Warning: Your scoreboard might not show because you haven\'t added any lines to it yet.'));
        }
        this.render();
        sandstone_1.scoreboard.objectives.setDisplay((teamColor !== undefined) ? `sidebar.team.${teamColor}` : ('sidebar'), this.objectiveName);
        if (this.animated) {
            this.animationState.set(0);
            sandstone_1.functionCmd(`${init_1.dataPack.defaultNamespace}:custom_scoreboards/${this.index}/animate`);
        }
    }
}
exports.Scoreboard = Scoreboard;
Scoreboard.instances = [];
