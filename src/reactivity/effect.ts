import { extend } from "../shared/utils";

class ReactiveEffect {
    private _fn: any
    public scheduler: any;
    public deps: any = [];
    // 针对 stop 可能会被多次清空的问题
    private active = true
    public onStop: any = () => {};
    constructor(fn, scheduler) {
        this._fn = fn
        this.scheduler = scheduler
    }

    run() {
        activeEffect = this;

        // 可以收集依赖 收集完成之后 则不能再次收集依赖了
        shouldTrack = true
        const res = this._fn()
        shouldTrack = false

        return res
    }

    stop() {
        // 防止被多次清空
        if (this.active) {
            // 移除掉 targetMap 对应的 effect 
            cleanupEffect(this);
            this.active = false
            this.deps.length = 0
            // 执行 onStop
            if(this.onStop){
                this.onStop()
            }
        }
    }
}

function cleanupEffect(effect) {
    effect.deps.forEach(dep => {
        // dep.delete(effect)
        // 清空即可
        dep.clear();
    });
}

// 是否应当继续收集
// 如果被 stop 了的话 ，不应当再收集依赖了
let shouldTrack = false

const targetMap = new Map();
// 收集依赖
export function track(target, key) {
    if (!shouldTrack && !activeEffect) return;
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep)
    }

    dep.add(activeEffect)

    if (activeEffect.deps.indexOf(dep) === -1) {
        // 为了能在 stop 中找到 dep
        activeEffect.deps.push(dep)
    }

}

// 触发依赖
export function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;
    const dep = depsMap.get(key)

    dep.forEach(effectFn => {
        // 如果有 scheduler ，就不会执行 run 自身
        if (effectFn.scheduler) {
            effectFn.scheduler()
        }
        else {
            effectFn.run()
        }
        // console.log("effectFn",effectFn);
    })
}

// 当前活跃的 effect
let activeEffect;

// 收集依赖的函数
export function effect(fn, options: any = {}) {
    const scheduler = options.scheduler
    // 当我们调用 effect 的时候 ，执行里面的函数
    let _effect = new ReactiveEffect(fn, scheduler)

    // 执行函数
    _effect.run()

    extend(_effect,options)
    // _effect.onStop = options.onStop

    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect

    return runner
}

// 停止
export function stop(runner) {
    runner.effect.stop()
}