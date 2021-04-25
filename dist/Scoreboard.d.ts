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
    private render;
    /**
     * @param displayName A JSONTextComponent containing the text information for the default scoreboard display
     */
    constructor(displayName: JSONTextComponent);
    /**
     * Adds a Line to the scoreboard
     * @param line The Line instance to add to the scoreboard
     * @param priority The priority for how high up your line appears in the scoreboard
     */
    addLine(line: Line, priority?: number): void;
    /**
     * Animates the scoreboard display through an array of specified keyframes
     * @param keyframes An array of JSONTextComponents with the added (optional) duration parameter, specified in ticks
     */
    animate(keyframes: ({
        display: JSONTextComponent;
        duration?: number;
    })[]): void;
    /**
     * Hides the scoreboard
     * @param teamColor The color of the team to hide the scoreboard from
     */
    hide(teamColor?: BASIC_COLORS): void;
    /**
     * Removes all matching Line instances from the scoreboard
     * @param line The Line instance to remove from the scoreboard
     */
    removeLine(line: Line): void;
    /**
     * Shows the scoreboard
     * @param teamColor The color of the team to show the scoreboard to
     */
    show(teamColor?: BASIC_COLORS): void;
}
