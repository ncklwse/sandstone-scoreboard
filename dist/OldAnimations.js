"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Animations = void 0;
const sandstone_1 = require("sandstone");
const init_1 = require("sandstone/init");
class Animations {
    constructor(name, animationFn) {
        this.animations = [];
        this.currentAnimation = sandstone_1.Variable(-1);
        this.currentKeyframe = sandstone_1.Variable(-1);
        this.animationFn = animationFn;
        this.name = name;
    }
    animate(keyframes) {
        this.currentAnimation.set(this.animations.length);
        this.currentKeyframe.set(0);
        this.animations.push(keyframes);
        sandstone_1.MCFunction(`animations/${this.name}`, () => {
            for (let i = 0; i < this.animations.length; i++) {
                init_1._.if(this.currentAnimation.equalTo(i), () => {
                    init_1._.if(init_1._.or(this.currentKeyframe.lessThan(0), this.currentKeyframe.greaterOrEqualThan(this.animations[i].length)), () => {
                        this.currentKeyframe.set(0);
                    });
                    for (let j = this.animations[i].length - 1; j >= 0; j--) {
                        init_1._.if(this.currentKeyframe.equalTo(j), () => {
                            this.currentKeyframe.add(1);
                            sandstone_1.schedule.function(`${init_1.dataPack.defaultNamespace}:animations/${this.name}`, this.animationFn(this.animations[i][j]));
                        });
                    }
                });
            }
        }, { onConflict: 'replace' });
    }
    start() {
        sandstone_1.functionCmd(`${init_1.dataPack.defaultNamespace}:animations/${this.name}`);
    }
    stop() {
        sandstone_1.schedule.clear(`${init_1.dataPack.defaultNamespace}:animations/${this.name}`);
    }
}
exports.Animations = Animations;
Animations.instances = [];
