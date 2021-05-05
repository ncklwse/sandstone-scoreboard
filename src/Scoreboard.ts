import chalk from 'chalk';
import { MCFunction, raw, scoreboard, Variable } from 'sandstone';
import { dataPack, _ } from 'sandstone/init';
import { Animations } from './Animations';
import { DeepPartialScoreboardState, KeyedArray, Keyframe, Line, LineComponent, ScoreboardSlot, ScoreboardState } from './Interfaces';
import { deepAssign, getNameFromLine, trackDifferences } from './Utils';

export class Scoreboard {

    private static instances: Scoreboard[] = [];
    private static visibility: {[key in ScoreboardSlot]?: ReturnType<typeof Variable>} = {};

    private animations: Animations;
    private lineAnimations: {[key: number]: Animations} = {};
    private lineNames: string[] = [];
    private lineScoreToRemove = Variable(-1);
    private renderCommands: string[] = [];
    private renderQueue: DeepPartialScoreboardState = {};
    private index: number = Scoreboard.instances.length;
    private state: ScoreboardState = {animated: false, display: '', initialized: false, lines: [], visibility: {}};

    /**
     * Renders a new scoreboard state based on previously rendered scoreboard states
     * @param newState The new (partial) state to render
     */
    private render(newState: Partial<ScoreboardState>) {

        this.renderQueue = deepAssign(this.renderQueue, trackDifferences(this.state, newState));

        // Add scoreboard if initialized
        if (this.renderQueue.initialized === true && typeof this.renderQueue.display !== undefined) {
            this.renderCommands.push(`scoreboard objectives remove sb_${dataPack.packUid}_${this.index}`);
            this.renderCommands.push(`scoreboard objectives add sb_${dataPack.packUid}_${this.index} dummy ${JSON.stringify(this.renderQueue.display)}`);
        }

        // Remove scoreboard if not initialized
        if (this.renderQueue.initialized === false) {
            this.renderCommands.push(`scoreboard objectives remove sb_${dataPack.packUid}_${this.index}`);
        }

        // Change scoreboard displayname and stop animations if necessary
        if (typeof this.renderQueue.initialized === undefined && typeof this.renderQueue.display !== undefined) {
            
            this.renderCommands.push(`scoreboard objectives modify sb_${dataPack.packUid}_${this.index} displayname ${JSON.stringify(this.renderQueue.display)}`);
            
            if (this.state.animated) {
                this.renderQueue.animated = false;
            }

        }

        // Loop through lines if necessary (second condition is to fix type error)
        if (typeof this.renderQueue.lines !== 'undefined' && typeof this.state.lines !== 'undefined') {
            for (const [i, line] of Object.entries(this.renderQueue.lines)) {

                // Reset "player" if score is negative
                if (typeof line.score !== 'undefined' && line.score < 0) {
                    this.renderCommands.push(`scoreboard players reset ${(line.display ?? this.state.lines[Number(i)].display)[line.nameIndex ?? this.state.lines[Number(i)].nameIndex].text} sb_${dataPack.packUid}_${this.index}`);
                }

                // Add team if it doesn't exist
                if (typeof line.display !== 'undefined' && typeof line.nameIndex !== 'undefined' && typeof line.score !== 'undefined') {
                    this.renderCommands.push(`team add sb_${dataPack.packUid}_${this.index}_${i}`);
                    this.renderCommands.push(`team join sb_${dataPack.packUid}_${this.index}_${i} ${(line.display ?? this.state.lines[Number(i)].display)[line.nameIndex ?? this.state.lines[Number(i)].nameIndex].text}`);
                }

                // Modify team properties if the display or name index changed
                if (typeof line.display !== 'undefined' || typeof line.nameIndex !== 'undefined' ) {

                    // Modify color if changed
                    if (typeof line.display?.[line.nameIndex ?? this.state.lines[Number(i)].nameIndex]?.color !== 'undefined') {
                        this.renderCommands.push(`team modify sb_${dataPack.packUid}_${this.index}_${i} color ${line.display?.[line.nameIndex ?? this.state.lines[Number(i)].nameIndex].color}`);
                    }

                    // Modify prefix and suffix
                    this.renderCommands.push(`team modify sb_${dataPack.packUid}_${this.index}_${i} prefix ${JSON.stringify(Object.values({...this.state.lines[Number(i)]?.display, ...line.display}).slice(0, line.nameIndex ?? this.state.lines[Number(i)].nameIndex))}`);
                    this.renderCommands.push(`team modify sb_${dataPack.packUid}_${this.index}_${i} suffix ${JSON.stringify(Object.values({...this.state.lines[Number(i)]?.display, ...line.display}).slice((line.nameIndex ?? this.state.lines[Number(i)].nameIndex) + 1))}`);

                }

                // Remove and re-add scoreboard player if changed
                if (typeof line.display?.[line.nameIndex ?? this.state.lines[Number(i)].nameIndex]?.text !== 'undefined' && Number(i) in this.state.lines && !!dataPack.currentFunction && dataPack.currentFunction.isResource) {

                    this.renderCommands.push(`scoreboard players set ${this.lineScoreToRemove.target} ${this.lineScoreToRemove.objective} ${line.score ?? this.state.lines[Number(i)].score}`)
                    this.renderCommands.push(`function ${dataPack.defaultNamespace}:__scoreboards__/${this.index}/remove_lines`);

                    this.renderCommands.push(`scoreboard players set ${line.display[line.nameIndex ?? this.state.lines[Number(i)].nameIndex].text} sb_${dataPack.packUid}_${this.index} ${this.state.lines[Number(i)].score}`);
                    this.renderCommands.push(`team join sb_${dataPack.packUid}_${this.index}_${i} ${(line.display ?? this.state.lines[Number(i)].display)[line.nameIndex ?? this.state.lines[Number(i)].nameIndex].text}`);

                    this.lineNames.push(line.display[line.nameIndex ?? this.state.lines[Number(i)].nameIndex].text);

                }   

                // Set score if the score changed
                if (typeof line.score !== 'undefined') {
                    this.renderCommands.push(`scoreboard players set ${(line.display ?? this.state.lines[Number(i)].display)[line.nameIndex ?? this.state.lines[Number(i)].nameIndex].text} sb_${dataPack.packUid}_${this.index} ${line.score}`);
                }
                // Animate line if necessary
                if (typeof line.animated !== 'undefined' && line.animated) {
                    this.renderCommands.push(`function ${dataPack.defaultNamespace}:__scoreboards__/${this.index}/animations/lines/${i}`);
                }

                // Stop animations if specified
                if (newState.lines?.[Number(i)]?.animated === false) {
                    this.renderCommands.push(`schedule clear ${dataPack.defaultNamespace}:__scoreboards__/${this.index}/animations/lines/${i}`);
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
                    this.renderCommands.push(`scoreboard objectives setdisplay ${slot} sb_${dataPack.packUid}_${this.index}`);
                    Scoreboard.visibility[slot as ScoreboardSlot] = Variable(this.index);
                }

                if (visible && this.state.visibility[(slot ?? 'sidebar') as ScoreboardSlot] === false) {
                    this.renderCommands.push(`scoreboard objectives setdisplay ${slot} sb_${dataPack.packUid}_${this.index}`);
                    Scoreboard.visibility[slot as ScoreboardSlot]?.set(this.index);
                }

                if (!visible && this.state.visibility[(slot ?? 'sidebar') as ScoreboardSlot] === true) {
                    this.renderCommands.push(`scoreboard objectives setdisplay ${slot}`);
                    Scoreboard.visibility[slot as ScoreboardSlot]?.set(-1);
                }

            }
        }

        // Animate objective if necessary
        if (typeof this.renderQueue.animated !== 'undefined') {
            
            if (this.renderQueue.animated) {
                this.renderCommands.push(`function ${dataPack.defaultNamespace}:__scoreboards__/${this.index}/animations/objective`);
            }

            if (!this.renderQueue.animated) {
                this.renderCommands.push(`schedule clear ${dataPack.defaultNamespace}:__scoreboards__/${this.index}/animations/objective`);
            }

        }

        // Update basic scoreboard states
        this.state = deepAssign(this.state, newState);

        const createRenderFn = (commands: String[]) => {
            commands = [...commands];
            return () => {
                commands.forEach(cmd => {
                    raw(cmd);
                });
                this.renderQueue = {};
            }
        }
        
        // Render stuff now if we're in a function
        if (!!dataPack.currentFunction && !!dataPack.currentFunction.isResource) {
            createRenderFn(this.renderCommands)();
        }
        
        // Run rendering code on init if we aren't in a function
        if (!dataPack.currentFunction || !dataPack.currentFunction.isResource) {
            MCFunction(`__scoreboards__/${this.index}/init`, createRenderFn(this.renderCommands), {onConflict: 'replace'});
        }

        MCFunction(`__scoreboards__/${this.index}/remove_lines`, () => {
            this.lineNames.filter((lineName, i) => {
                
                if (this.lineNames.indexOf(lineName) !== i) {
                    return false;
                }

                raw(`execute if score ${this.lineScoreToRemove.target} ${this.lineScoreToRemove.objective} = ${lineName} sb_${dataPack.packUid}_${this.index} run scoreboard players reset ${lineName} sb_${dataPack.packUid}_${this.index}`);
                return true;

            });
        }, {onConflict: 'replace'});
        
        this.renderCommands = [];

    }
    
    /**
     * @param display The LineComponent containing the text information for the default scoreboard display
     */
    constructor(display: LineComponent) {

        this.animations = new Animations(this.index, 'objective', (keyframe) => {
            scoreboard.objectives.modify(`sb_${dataPack.packUid}_${this.index}`, 'displayname', keyframe.display);
        });

        this.render({
            initialized: true,
            display: display,
            lines: []
        });

        dataPack.initCommands.push(['function', `${dataPack.defaultNamespace}:__scoreboards__/${this.index}/init`]);
        Scoreboard.instances.push(this);

    }

    /**
     * Adds a line to the scoreboard
     * @param lineComponent The LineComponent to add to the scoreboard
     * @param priority The priority for how high up your line appears in the scoreboard; defaults to 0
     * @returns An interface for modifying the line
     */
    addLine(lineComponent: LineComponent, priority?: number) {

        const [initialNameIndex, initialLine] = getNameFromLine(lineComponent, this.lineNames);
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
                    score: (line.score >= (priority ?? 0)) ? line.score + 1 : line.score
                }] as [string, Line]).reduce((reduced, [i, line]) => ({
                    ...reduced,
                    [i]: {...line}
                }), {} as KeyedArray<Line>),
                [index]: {
                    animated: false,
                    display: initialLine,
                    nameIndex: initialNameIndex, 
                    score: ((priority ?? 0) > maxPriority) ? maxPriority : (priority ?? 0)
                }
            }
        });
        
        return {

            /**
             * Animates the scoreboard line
             * @param keyframes The array of Keyframes to animate through
             */
            animate(keyframes: Keyframe[]) {
                
                if (!(index in scoreboard.lineAnimations)) {
                    scoreboard.lineAnimations[index] = new Animations(scoreboard.index, `lines/${index}`, (keyframe) => {
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
                })
            },

            /**
             * Sets the text of the line
             * @param lineComponent The new LineComponent to replace the old one
             */
            setText(lineComponent: LineComponent) {

                const [newNameIndex, newLine] = getNameFromLine(lineComponent, scoreboard.lineNames);

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

        }

    }

    /**
     * Animates the scoreboard display
     * @param keyframes The array of Keyframes to animate through
     */
    animate(keyframes: Keyframe[]) {
        this.animations.animate(keyframes);
        this.render({
            animated: true
        });
    }

    /**
     * Hides the scoreboard
     * @param displaySlot The display slot to show the scoreboard to; defaults to all display slots
     */
    hide(displaySlot?: ScoreboardSlot | ScoreboardSlot[]) {
        this.render({
            visibility: ((displaySlot instanceof Array ? displaySlot : [displaySlot ?? 'sidebar']) as ScoreboardSlot[]).reduce((reduced, current) => ({
                ...reduced,
                [current]: false
            }), {} as {[key in ScoreboardSlot]?: boolean})
        });
    }

    /**
     * Sets the text of the scoreboard display; stops any currently running animations
     * @param display The LineComponent containing the text information for the new scoreboard display
     */
    setText(display: LineComponent) {
        this.render({display});
    }

    /**
     * Shows the scoreboard
     * @param displaySlot The display slot to show the scoreboard to; defaults to 'sidebar', or all players/teams
     */
    show(displaySlot?: ScoreboardSlot | ScoreboardSlot[]) {

        if (Object.values(this.state.lines).length < 1) {
            console.warn(chalk.keyword('orange')('Warning: Your scoreboard might not show because you haven\'t added any lines to it yet.'));
        }

        this.render({
            visibility: ((displaySlot instanceof Array ? displaySlot : [displaySlot ?? 'sidebar']) as ScoreboardSlot[]).reduce((reduced, current) => ({
                ...reduced,
                [current]: true
            }), {} as {[key in ScoreboardSlot]?: boolean})
        });

    }

}