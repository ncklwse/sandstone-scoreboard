"use strict";
// import { BASIC_COLORS, DISPLAY_SLOTS, execute, functionCmd, MCFunction, Objective, raw, schedule, Score, scoreboard, team, tellraw, Variable } from 'sandstone';
// import { command } from 'sandstone/commands/decorators';
// import { dataPack, _ } from 'sandstone/init';
// import { Animations } from './Animations';
// import { JSONLineComponent, Keyframe, Line, LineComponent, ScoreboardSlot } from './Interfaces';
// import { getNameFromLine, parseLineComponent } from './Utils';
// export class Scoreboard {
//     private static instances: Scoreboard[] = [];
//     private static visibility: {[key in Exclude<DISPLAY_SLOTS, 'belowName' | 'list'>]?: ReturnType<typeof Variable>} = {};
//     private animations: Animations;
//     private currentAnimation = Variable(-1);
//     private currentKeyframe = Variable(0);
//     private display: LineComponent;
//     private index: number;
//     private initialDisplay: LineComponent;
//     private lines: Line[] = [];
//     private renderQueue: (() => void)[] = [];
//     private objectiveName: string;
//     private overallVisibility = Variable(0);
//     private teams: number = 0;
//     /**
//      * Executes the given function in the current in the current function. If not in a function, then executes the given function when the datapack loads.
//      * @param renderFn 
//      */
//     private render(renderFn: (() => void)) {
//         if (!!dataPack.currentFunction && !!dataPack.currentFunction.isResource) {
//             renderFn();
//             return;
//         }
//         this.renderQueue.push(renderFn);
//         MCFunction(`__scoreboards__`, () => {
//             for (const fn of this.renderQueue) fn();
//         }, {onConflict: 'replace'});
//     }
//     /**
//      * @param display The LineComponent containing the text information for the default scoreboard display
//      */
//     constructor(display: LineComponent) {
//         this.display = display;
//         this.index = Scoreboard.instances.length;
//         this.initialDisplay = display;
//         this.objectiveName = `sb_${dataPack.packUid}_${Scoreboard.instances.length}`;
//         this.animations = new Animations(this.objectiveName.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`), (keyframe) => {
//             scoreboard.objectives.modify(this.objectiveName, 'displayname', parseLineComponent(keyframe.display));
//             return keyframe.duration ?? 20;
//         });
//         this.render(() => {
//             scoreboard.objectives.add(this.objectiveName, 'dummy', this.display);
//         });
//         if (Scoreboard.instances.length === 0) {
//             dataPack.initCommands.push(['function', `${dataPack.defaultNamespace}:__scoreboards__`]);
//         }
//         Scoreboard.instances.push(this);
//     }
//     /**
//      * Adds a Line to the scoreboard
//      * @param lineComponent The LineComponent to add to the scoreboard
//      * @param priority The priority for how high up your line appears in the scoreboard; defaults is 0
//      */
//     addLine(lineComponent: LineComponent, priority?: number) {
//         const [initialNameIndex, initialLine] = getNameFromLine(lineComponent, this.lines);
//         let nameIndex = initialNameIndex;
//         let line = initialLine;
//         let teamIndex = this.teams;
//         this.teams++;
//         this.lines.forEach((existingLine, i) => {
//             if (existingLine.score >= (priority ?? 0)) {
//                 this.lines[i].score++;
//                 this.render(() => {
//                     scoreboard.players.set(existingLine.display[existingLine.nameIndex].text, this.objectiveName, this.lines[i].score);                    
//                 });
//             }
//         });
//         this.lines.push({
//             display: line,
//             nameIndex: nameIndex,
//             score: priority ?? 0
//         });
//         this.render(() => {
//             scoreboard.players.set(line[nameIndex].text, this.objectiveName, priority ?? 0);
//             team.add(`${this.objectiveName}_${teamIndex}`);
//             team.modify(`${this.objectiveName}_${teamIndex}`, 'prefix', JSON.stringify(line.slice(0, nameIndex)));
//             team.modify(`${this.objectiveName}_${teamIndex}`, 'color', line[nameIndex].color);
//             team.modify(`${this.objectiveName}_${teamIndex}`, 'suffix', JSON.stringify(line.slice(nameIndex + 1)));
//             team.join(`${this.objectiveName}_${teamIndex}`, line[nameIndex].text);
//         });
//         const lineIndex = this.lines.length - 1;
//         const $this = this;
//         return {
//             /**
//              * Animates the text of the line
//              * @param keyframes The array of Keyframes to animate through
//              */
//             animate(keyframes: Keyframe[]) {
//                 // aaaaaaaaaaaaaaaaaaaaaa
//             },
//             /**
//              * Edits the the text of the line
//              * @param lineComponent The new LineComponent to replace the old one
//              */
//             edit(lineComponent: LineComponent) {
//                 const [newNameIndex, newLine] = getNameFromLine(lineComponent, $this.lines.slice(0, nameIndex).concat($this.lines.slice(nameIndex + 1)));
//                 $this.render(() => {
//                     scoreboard.players.reset(line[nameIndex].text, $this.objectiveName);
//                 });
//                 teamIndex = $this.teams;
//                 $this.teams++;
//                 $this.render(() => {
//                     if (line[nameIndex].text === newLine[newNameIndex].text) {
//                         scoreboard.players.set(newLine[newNameIndex].text, $this.objectiveName, $this.lines[lineIndex].score);
//                     }
//                     team.add(`${$this.objectiveName}_${teamIndex}`);
//                     team.modify(`${$this.objectiveName}_${teamIndex}`, 'prefix', JSON.stringify(newLine.slice(0, newNameIndex)));
//                     team.modify(`${$this.objectiveName}_${teamIndex}`, 'color', newLine[newNameIndex].color);
//                     team.modify(`${$this.objectiveName}_${teamIndex}`, 'suffix', JSON.stringify(newLine.slice(newNameIndex + 1)));
//                     team.join(`${$this.objectiveName}_${teamIndex}`, newLine[newNameIndex].text);
//                 });
//                 line = newLine;
//                 $this.lines[lineIndex].display = line;
//                 nameIndex = newNameIndex;
//                 $this.lines[lineIndex].nameIndex = nameIndex;
//             },
//             /**
//              * Moves the line downwards in the scoreboard
//              * @param amount The amount of lines to move down; defaults to 1
//              */
//             moveDown(amount?: number) {
//                 $this.lines.forEach((storedLine, i) => {
//                     if (i === lineIndex) return;
//                     if (storedLine.score >= ($this.lines[lineIndex].score - (amount ?? 1)) && storedLine.score < $this.lines[lineIndex].score) {
//                         $this.lines[i].score++;
//                         $this.render(() => {
//                             scoreboard.players.add($this.lines[i].display[$this.lines[i].nameIndex].text, $this.objectiveName, 1);
//                         });
//                     }
//                 });
//                 $this.lines[lineIndex].score -= amount ?? 1;
//                 $this.render(() => {
//                     scoreboard.players.remove($this.lines[lineIndex].display[nameIndex].text, $this.objectiveName, amount ?? 1);
//                 });
//             },
//             /**
//              * Moves the line upwards in the scoreboard
//              * @param amount The amount of lines to move up; defaults to 1
//              */
//             moveUp(amount?: number) {
//                 $this.lines.forEach((storedLine, i) => {
//                     if (i === lineIndex) return;
//                     if (storedLine.score <= ($this.lines[lineIndex].score + (amount ?? 1)) && storedLine.score > $this.lines[lineIndex].score) {
//                         $this.lines[i].score--;
//                         $this.render(() => {
//                             scoreboard.players.remove($this.lines[i].display[$this.lines[i].nameIndex].text, $this.objectiveName, 1);
//                         });
//                     }
//                 });
//                 $this.lines[lineIndex].score += amount ?? 1;
//                 $this.render(() => {
//                     scoreboard.players.add($this.lines[lineIndex].display[nameIndex].text, $this.objectiveName, amount ?? 1);
//                 });
//             },
//             /**
//              * Resets the line to its initial value
//              */
//             reset() {
//                 this.edit(initialLine);
//             }
//         }
//     }
//     /**
//      * Animates the scoreboard display
//      * @param keyframes The array of Keyframes to animate through
//      */
//     animate(keyframes: Keyframe[]) {
//         this.render(() => {
//             this.animations.animate(keyframes);
//             const visible = Variable(0);
//             for (const score of Object.values(Scoreboard.visibility)) {
//                 if (typeof score !== 'undefined') {
//                     _.if(score.equalTo(this.index), () => {
//                         visible.set(1);
//                     });
//                 }
//             }
//             _.if(visible.equalTo(1), () => {
//                 this.render(() => {
//                     this.animations.start();
//                 });
//             });
//         });
//     }
//     /**
//      * Edits the scoreboard display; stops currently running animations
//      * @param display The LineComponent containing the text information for the new scoreboard display
//      */
//     edit(display: LineComponent) {
//         this.display = display;
//         this.render(() => {
//             this.animations.stop();
//             scoreboard.objectives.modify(this.objectiveName, 'displayname', this.display);
//         });
//     }
//     /**
//      * Hides the scoreboard
//      * @param displaySlot The display slot to show the scoreboard to; defaults to all display slots
//      */
//     hide(displaySlot?: keyof typeof Scoreboard['visibility'] | (keyof typeof Scoreboard['visibility'])[]) {
//         if (typeof displaySlot !== 'object') displaySlot = [displaySlot ?? 'sidebar'];
//         for (const slot of displaySlot) {
//             if (typeof Scoreboard.visibility[slot] === 'undefined') {
//                 Scoreboard.visibility[slot] = Variable(-1);
//             }
//             this.render(() => {
//                 _.if((Scoreboard.visibility[slot] as ReturnType<typeof Variable>).equalTo(this.index), () => {
//                     scoreboard.objectives.setDisplay(slot);
//                     Scoreboard.visibility[slot]?.set(-1);
//                 });
//             });
//         }
//         for (const objective of Object.values(Scoreboard.visibility)) {
//             if (typeof objective !== 'undefined') {
//                 this.render(() => {
//                     this.animations.stop();
//                     _.if(objective.equalTo(this.index), () => {
//                         this.overallVisibility.set(1);
//                     });
//                 });
//             }
//         }
//     }
//     /**
//      * Resets the scoreboard back to its initial state
//      */
//     reset() {
//         this.display = this.initialDisplay;
//         this.render(() => {
//             this.animations.stop();
//             scoreboard.objectives.remove(this.objectiveName);
//             for (let i = 0; i < this.teams; i++) {
//                 // Using raw() bc team.remove() is broken
//                 raw(`team remove ${this.objectiveName}_${this.teams}`);
//             }
//             scoreboard.objectives.add(this.objectiveName, 'dummy', this.initialDisplay);
//         });
//     }
//     /**
//      * Shows the scoreboard
//      * @param displaySlot The display slot to show the scoreboard to; defaults to 'sidebar', or all players/teams
//      */
//     show(displaySlot?: ScoreboardSlot | ScoreboardSlot[]) {
//         if (typeof displaySlot !== 'object') displaySlot = [displaySlot ?? 'sidebar'];
//         this.render(() => {
//             this.animations.start();
//         });
//         for (const slot of displaySlot) {
//             this.render(() => {
//                 Scoreboard.visibility[slot] = Scoreboard.visibility[slot] ?? Variable(-1);
//                 Scoreboard.visibility[slot]?.set(this.index);
//                 scoreboard.objectives.setDisplay(slot, this.objectiveName);
//             });
//         }
//     }
// }
