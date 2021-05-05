import { MCFunction, schedule, Variable } from 'sandstone';
import { dataPack, _ } from 'sandstone/init';
import { Keyframe } from './Interfaces';

export class Animations {

    private static instances: Animations[] = [];

    private animationFn: ((keyframe: Keyframe) => void);
    private animations: Keyframe[][] = [];
    private currentAnimation: ReturnType<typeof Variable> = Variable(-1);
    private currentKeyframe: ReturnType<typeof Variable> = Variable(-1);
    private index: number;
    private name: string;

    constructor(index: number, name: string, animationFn: ((keyframe: Keyframe) => void)) {
        this.animationFn = animationFn;
        this.index = index;
        this.name = name;
    }

    animate(keyframes: Keyframe[]) {
        
        // Change variable value if we are in a function
        if (!!dataPack.currentFunction && !!dataPack.currentFunction.isResource) {
            this.currentAnimation.set(this.animations.length);
            this.currentKeyframe.set(0);
        }

        // Reset variable if we aren't in a function
        if (!dataPack.currentFunction || !dataPack.currentFunction.isResource) {
            this.currentAnimation = Variable(this.animations.length);
            this.currentKeyframe = Variable(0);
        }
        
        this.animations.push(keyframes.concat(keyframes));

        MCFunction(`__scoreboards__/${this.index}/animations/${this.name}`, () => {
            for (let i = 0; i < this.animations.length; i++) {
                _.if(this.currentAnimation.equalTo(i), () => {

                    _.if(_.or(this.currentKeyframe.lessThan(0), this.currentKeyframe.greaterOrEqualThan(this.animations[i].length)), () => {
                        this.currentKeyframe.set(this.animations[i].length / 2);
                    });
                    
                    for (let j = 0; j < this.animations[i].length; j++) {
                        _.if(this.currentKeyframe.equalTo(j), () => {
                            this.animationFn(this.animations[i][j]);
                            schedule.function(`${dataPack.defaultNamespace}:__scoreboards__/${this.index}/animations/${this.name}`, this.animations[i][j].duration ?? 20);
                        });
                    }

                    this.currentKeyframe.add(1);

                });
            }
        }, {onConflict: 'replace'});

    }

    getAnimations() {
        return this.animations;
    }

}