import { extend } from "../shared/utils";


// 是否应当继续收集
// 如果被 stop 了的话 ，不应当再收集依赖了
let shouldTrack = false
// 当前活跃的 effect
let activeEffect;

export class ReactiveEffect {
    private _fn: any
    public scheduler: any;
    public deps: any = [];
    // 针对 stop 可能会被多次清空的问题
    private active = true
    public onStop: any = () => { };
    constructor(fn, scheduler) {
        this._fn = fn
        this.scheduler = scheduler
    }

    run() {
        // 如果是已经被 stop 了的，后面即使获取到 effect 返回的 runner ，
        //     并且执行 runner 也不能收集依赖
        if (!this.active) {
            return this._fn()
        }

        // 可以收集依赖 收集完成之后 则不能再次收集依赖了
        shouldTrack = true
        activeEffect = this;
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
            if (this.onStop) {
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

const targetMap = new Map();
// 收集依赖
export function track(target, key) {
    if (isTracking()) {
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
        trackEffects(dep)
    }
}

export function trackEffects(dep) {
    // 如果之前添加过 就不用添加了
    if (dep.has(activeEffect)) return;
    dep.add(activeEffect)
    // 为了能在 stop 中找到 dep
    activeEffect.deps.push(dep)
}

// 封装是否收集
export function isTracking() {
    return !(!shouldTrack || !activeEffect)
}

// 触发依赖
export function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;
    const dep = depsMap.get(key)
    triggerEffects(dep)
}

export function triggerEffects(dep) {
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


// 收集依赖的函数
export function effect(fn, options: any = {}) {
    const scheduler = options.scheduler
    // 当我们调用 effect 的时候 ，执行里面的函数
    let _effect = new ReactiveEffect(fn, scheduler)

    // 执行函数
    _effect.run()

    extend(_effect, options)
    // _effect.onStop = options.onStop

    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect

    return runner
}

// 停止
export function stop(runner) {
    runner.effect.stop()
}