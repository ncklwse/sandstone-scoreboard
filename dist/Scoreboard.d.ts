import { BASIC_COLORS, JSONTextComponent } from 'sandstone';
import { Line } from '.';
export declare class Scoreboard {
    private static instances;
    private animated;
    private animationState;
    private displayName;
    private index;
    private lines;
    private initialized;
    private objectiveName;
    private addRawLine;
    private parseRawLine;
    private ready;
    private removeRawLine;
    constructor(displayName: JSONTextComponent);
    addLine(line: Line, priority?: number): void;
    animate(keyframes: ({
        display: JSONTextComponent;
        duration?: number;
    })[]): void;
    hide(teamColor?: BASIC_COLORS): void;
    removeLine(line: Line): void;
    render(): void;
    show(teamColor?: BASIC_COLORS): void;
}
