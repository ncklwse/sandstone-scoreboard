import { Keyframe } from './Interfaces';
export declare class Animations {
    private static instances;
    private animationFn;
    private animations;
    private currentAnimation;
    private currentKeyframe;
    private index;
    private name;
    constructor(index: number, name: string, animationFn: ((keyframe: Keyframe) => void));
    animate(keyframes: Keyframe[]): void;
    getAnimations(): Keyframe[][];
}
