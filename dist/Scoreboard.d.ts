import { Keyframe, LineComponent, ScoreboardSlot } from './Interfaces';
export declare class Scoreboard {
    private static instances;
    private static visibility;
    private animations;
    private lineAnimations;
    private lineNames;
    private lineScoreToRemove;
    private renderCommands;
    private renderQueue;
    private index;
    private state;
    /**
     * Renders a new scoreboard state based on previously rendered scoreboard states
     * @param newState The new (partial) state to render
     */
    private render;
    /**
     * @param display The LineComponent containing the text information for the default scoreboard display
     */
    constructor(display: LineComponent);
    /**
     * Adds a line to the scoreboard
     * @param lineComponent The LineComponent to add to the scoreboard
     * @param priority The priority for how high up your line appears in the scoreboard; defaults to 0
     * @returns An interface for modifying the line
     */
    addLine(lineComponent: LineComponent, priority?: number): {
        /**
         * Animates the scoreboard line
         * @param keyframes The array of Keyframes to animate through
         */
        animate(keyframes: Keyframe[]): void;
        /**
         * Resets the line to its initial value
         */
        reset(): void;
        /**
         * Sets the text of the line
         * @param lineComponent The new LineComponent to replace the old one
         */
        setText(lineComponent: LineComponent): void;
    };
    /**
     * Animates the scoreboard display
     * @param keyframes The array of Keyframes to animate through
     */
    animate(keyframes: Keyframe[]): void;
    /**
     * Hides the scoreboard
     * @param displaySlot The display slot to show the scoreboard to; defaults to all display slots
     */
    hide(displaySlot?: ScoreboardSlot | ScoreboardSlot[]): void;
    /**
     * Sets the text of the scoreboard display; stops any currently running animations
     * @param display The LineComponent containing the text information for the new scoreboard display
     */
    setText(display: LineComponent): void;
    /**
     * Shows the scoreboard
     * @param displaySlot The display slot to show the scoreboard to; defaults to 'sidebar', or all players/teams
     */
    show(displaySlot?: ScoreboardSlot | ScoreboardSlot[]): void;
}
