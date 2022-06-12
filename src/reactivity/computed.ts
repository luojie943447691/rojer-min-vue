import { ReactiveEffect } from "./effect";


class ComputedImpl {
    _effect: any;
    dirty: boolean = true;
    _value: any;
    constructor(fn) {
        const effect = new ReactiveEffect(fn, () => {
            if (!this.dirty) {
                this.dirty = true
            }
        })
        this._effect = effect
    }

    get value() {
        if (this.dirty) {
            return (this.dirty = false, this._value = this._effect.run())
        }
        else {
            return this._value
        }
    }
}


export function computed(fn) {
    return new ComputedImpl(fn)
}