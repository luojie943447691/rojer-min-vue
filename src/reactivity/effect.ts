
class ReactiveEffect{
    private _fn: any
    constructor(fn){
        this._fn = fn
    }

    run(){
        activeEffect = this;
        return this._fn()
    }
}

const targetMap = new Map();
// 收集依赖
export function track(target,key){

    let depsMap = targetMap.get(target)
    if(!depsMap){
        depsMap = new Map();
        targetMap.set(target,depsMap)
    }

    let dep = depsMap.get(key)
    if(!dep){
        dep = new Set();
        depsMap.set(key,dep)
    }

    dep.add(activeEffect)
}

// 触发依赖
export function trigger(target,key){
    const depsMap = targetMap.get(target);
    if(!depsMap) return;
    const dep = depsMap.get(key)

    dep.forEach(effectFn => {
        effectFn.run()
        // console.log("effectFn",effectFn);
    })
}

// 当前活跃的 effect
let activeEffect;

// 收集依赖的函数
export function effect(fn){
    // 当我们调用 effect 的时候 ，执行里面的函数
    let _effect =new ReactiveEffect(fn)

    // 执行函数
    _effect.run()

    return _effect.run.bind(_effect)
}