"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Animations = void 0;
const sandstone_1 = require("sandstone");
const init_1 = require("sandstone/init");
class Animations {
    constructor(index, name, animationFn) {
        this.animations = [];
        this.currentAnimation = sandstone_1.Variable(-1);
        this.currentKeyframe = sandstone_1.Variable(-1);
        this.animationFn = animationFn;
        this.index = index;
        this.name = name;
    }
    animate(keyframes) {
        // Change variable value if we are in a function
        if (!!init_1.dataPack.currentFunction && !!init_1.dataPack.currentFunction.isResource) {
            this.currentAnimation.set(this.animations.length);
            this.currentKeyframe.set(0);
        }
        // Reset variable if we aren't in a function
        if (!init_1.dataPack.currentFunction || !init_1.dataPack.currentFunction.isResource) {
            this.currentAnimation = sandstone_1.Variable(this.animations.length);
            this.currentKeyframe = sandstone_1.Variable(0);
        }
        this.animations.push(keyframes.concat(keyframes));
        sandstone_1.MCFunction(`__scoreboards__/${this.index}/animations/${this.name}`, () => {
            for (let i = 0; i < this.animations.length; i++) {
                init_1._.if(this.currentAnimation.equalTo(i), () => {
                    init_1._.if(init_1._.or(this.currentKeyframe.lessThan(0), this.currentKeyframe.greaterOrEqualThan(this.animations[i].length)), () => {
                        this.currentKeyframe.set(this.animations[i].length / 2);
                    });
                    for (let j = 0; j < this.animations[i].length; j++) {
                        init_1._.if(this.currentKeyframe.equalTo(j), () => {
                            var _a;
                            this.animationFn(this.animations[i][j]);
                            sandstone_1.schedule.function(`${init_1.dataPack.defaultNamespace}:__scoreboards__/${this.index}/animations/${this.name}`, (_a = this.animations[i][j].duration) !== null && _a !== void 0 ? _a : 20);
                        });
                    }
                    this.currentKeyframe.add(1);
                });
            }
        }, { onConflict: 'replace' });
    }
    getAnimations() {
        return this.animations;
    }
}
exports.Animations = Animations;
Animations.instances = [];
