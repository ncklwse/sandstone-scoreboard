import { BASIC_COLORS, DISPLAY_SLOTS } from 'sandstone';

export type KeyedArray<T> = {[key: number]: T}

export interface JSONLineComponent {
    bold?: boolean
    color?: BASIC_COLORS
    italics?: boolean
    obfuscated?: boolean
    strikethrough?: boolean
    text: string
    underlined?: boolean
}

export interface Keyframe {
    display: LineComponent
    duration?: number
}

export interface Line {
    animated: boolean
    display: KeyedArray<Required<JSONLineComponent>>
    nameIndex: number
    score: number
}

export type LineComponent = string | number | boolean | JSONLineComponent | LineComponent[];

export interface DeepPartialScoreboardState {
    animated?: boolean
    display?: LineComponent
    initialized?: boolean
    lines?: KeyedArray<Partial<Line>>
    visibility?: {[key in ScoreboardSlot]?: boolean}
}

export type ScoreboardSlot = Exclude<DISPLAY_SLOTS, 'belowName' | 'list'>

export interface ScoreboardState {
    animated: boolean
    display: LineComponent
    initialized: boolean
    lines: KeyedArray<Line>
    visibility: {[key in ScoreboardSlot]?: boolean}
}