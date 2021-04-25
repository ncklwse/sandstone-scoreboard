import { BASIC_COLORS, DISPLAY_SLOTS, functionCmd, JSONTextComponent, MCFunction, schedule, scoreboard, team, TextComponentObject, Variable } from 'sandstone';
import { dataPack, _ } from 'sandstone/init';
import * as chalk from 'chalk';
import { Line } from '.';

interface customJSONTextComponent {
    text: string,
    color?: BASIC_COLORS
}

export class Scoreboard {
    
    private static instances: Scoreboard[] = [];
    
    private animated: boolean = false;
    private animationState: ReturnType<typeof Variable> = Variable(0);
    private displayName: JSONTextComponent | JSONTextComponent[];
    private index: number;
    private lines: { [key: string]: { line: customJSONTextComponent[], lineId?: number, nameIndex: number, score: number } } = {};
    private initialized: boolean = false;
    private objectiveName: string;

    private addRawLine(line: customJSONTextComponent | customJSONTextComponent[], priority?: number) {

        const [nameIndex, parsedLine]: [number, customJSONTextComponent[]] = this.parseRawLine(line);

        Object.keys(this.lines).forEach(key => {
            if (this.lines[key].score >= (priority ?? 0)) this.lines[key].score++;
        });

        this.lines[parsedLine[nameIndex].text] = {
            line: parsedLine,
            nameIndex: nameIndex,
            score: (priority !== undefined ? priority > Object.keys(this.lines).length ? Object.keys(this.lines).length : priority : 0)
        }

        return parsedLine[nameIndex].text;
        
    }

    private parseRawLine(line: customJSONTextComponent | customJSONTextComponent[]) {

        if (!(line instanceof Array)) line = [line];
        
        let nameIndex: number = 0;
        let positionInName: [number, number] = [0, 1];
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
                    positionInName = [relativePositionInName[0] + (name.index ?? 0), relativePositionInName[1] + (name.index ?? 0)];
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
            color: line[nameIndex].color ?? 'white'
        }, {
            text: line[nameIndex].text.substring(positionInName[0], positionInName[1]),
            color: line[nameIndex].color ?? 'white'
        }, {
            text: line[nameIndex].text.substring(positionInName[1]),
            color: line[nameIndex].color ?? 'white'
        }]), ...line.slice(nameIndex + 1)];

        nameIndex++;

        return [nameIndex, line] as [number, customJSONTextComponent[]];

    }

    private ready() {
        if (!this.initialized) {
            this.initialized = true;
            scoreboard.objectives.add(this.objectiveName, 'dummy', this.displayName);
        }
    }

    private render() {

        this.ready();

        scoreboard.players.reset('*', this.objectiveName);

        let generatedTeams = 0;
        for (const [name, {line, nameIndex, score}] of Object.entries(this.lines)) {
            team.add(`anon_${dataPack.packUid}_${generatedTeams}`);
            team.modify(`anon_${dataPack.packUid}_${generatedTeams}`, 'prefix', JSON.stringify(line.slice(0, nameIndex)));
            team.modify(`anon_${dataPack.packUid}_${generatedTeams}`, 'color', line[nameIndex].color ?? 'white');
            team.modify(`anon_${dataPack.packUid}_${generatedTeams}`, 'suffix', JSON.stringify(line.slice(nameIndex + 1)));
            team.join(`anon_${dataPack.packUid}_${generatedTeams}`, name);
            scoreboard.players.set(name, this.objectiveName, score);
            generatedTeams++;

        }

    }

    /**
     * @param displayName A JSONTextComponent containing the text information for the default scoreboard display
     */
    constructor(displayName: JSONTextComponent) {
        this.displayName = displayName;
        this.index = Object.keys(Scoreboard.instances).length;
        this.objectiveName = `anon_${dataPack.packUid}_${this.index}`;
        Scoreboard.instances.push(this);
    }

    /**
     * Adds a Line to the scoreboard
     * @param line The Line instance to add to the scoreboard
     * @param priority The priority for how high up your line appears in the scoreboard
     */
    addLine(line: Line, priority?: number) {

        let nameIndex = this.addRawLine(line._getRawData(), priority ?? 0);

        line._onUpdate((cancelListener) => {
            if (nameIndex in this.lines) {

                const [newNameIndex, parsedNewLine] = this.parseRawLine(line._getRawData());

                this.lines[parsedNewLine[newNameIndex].text] = {
                    line: parsedNewLine,
                    lineId: line._getId(),
                    nameIndex: newNameIndex,
                    score: this.lines[nameIndex].score
                }

                delete this.lines[nameIndex];

                if (!!dataPack.currentFunction && !!dataPack.currentFunction.isResource) {
                    this.render();
                }

            } else {
                cancelListener();
            }
        });

        this.lines[nameIndex].lineId = line._getId();

        if (!!dataPack.currentFunction && !!dataPack.currentFunction.isResource) {
            this.render();
        }

    }
    
    /**
     * Animates the scoreboard display through an array of specified keyframes
     * @param keyframes An array of JSONTextComponents with the added (optional) duration parameter, specified in ticks
     */
    animate(keyframes: ({ display: JSONTextComponent, duration?: number })[]) {

        this.animated = true;

        MCFunction(`custom_scoreboards/${this.index}/animate`, () => {
            
            _.if(this.animationState.equalTo(keyframes.length), () => {
                this.animationState.set(0);
            });

            for (let i = keyframes.length - 1; i >= 0; i--) {
                _.if(this.animationState.equalTo(i), () => {
                    this.displayName = keyframes[i].display;
                    scoreboard.objectives.modify(this.objectiveName, 'displayname', keyframes[i].display);
                    this.animationState.add(1);
                    schedule.function(`${dataPack.defaultNamespace}:custom_scoreboards/${this.index}/animate`, keyframes[i].duration ?? 20);
                });
            }

        }, { onConflict: 'replace' });

    }

    /**
     * Hides the scoreboard
     * @param teamColor The color of the team to hide the scoreboard from
     */
    hide(teamColor?: BASIC_COLORS) {

        this.ready();
        scoreboard.objectives.setDisplay((teamColor !== undefined) ? (`sidebar.team.${teamColor}` as DISPLAY_SLOTS) : ('sidebar'));
        scoreboard.objectives.remove(this.objectiveName);

        if (this.animated) {
            schedule.clear(`${dataPack.defaultNamespace}:custom_scoreboards/${this.objectiveName}/animate`);
            this.animationState.set(0);
        }

    }

    /**
     * Removes all matching Line instances from the scoreboard
     * @param line The Line instance to remove from the scoreboard
     */
    removeLine(line: Line) {

        const currentId = line._getId();

        Object.entries(this.lines).forEach(([nameIndex, storedLine]) => {
            if (storedLine.lineId === currentId) {
                delete this.lines[nameIndex];
            }
        });

        line._triggerUpdate();

        if (!!dataPack.currentFunction && !!dataPack.currentFunction.isResource) {
            this.render();
        }

    }

    /**
     * Shows the scoreboard
     * @param teamColor The color of the team to show the scoreboard to
     */
    show(teamColor?: BASIC_COLORS) {
        
        if (Object.keys(this.lines).length === 0) {
            console.warn(chalk.keyword('orange')('Warning: Your scoreboard might not show because you haven\'t added any lines to it yet.'));
        }

        this.render();
        scoreboard.objectives.setDisplay((teamColor !== undefined) ? (`sidebar.team.${teamColor}` as DISPLAY_SLOTS) : ('sidebar'), this.objectiveName);
        
        if (this.animated) {
            this.animationState.set(0);
            functionCmd(`${dataPack.defaultNamespace}:custom_scoreboards/${this.index}/animate`);
        }
        
    }

}