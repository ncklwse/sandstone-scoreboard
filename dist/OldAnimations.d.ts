import { Keyframe } from './Interfaces';
export declare class Animations {
    private static instances;
    private animationFn;
    private animations;
    private currentAnimation;
    private currentKeyframe;
    private name;
    constructor(name: string, animationFn: ((keyframe: Keyframe) => number));
    animate(keyframes: Keyframe[]): void;
    start(): void;
    stop(): void;
}
