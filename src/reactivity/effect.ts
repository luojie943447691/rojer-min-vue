
class ReactiveEffect{
    private _fn: any
    public scheduler: any;
    constructor(fn,scheduler){
        this._fn = fn
        this.scheduler = scheduler
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
        // 如果有 scheduler ，就不会执行 run 自身
        if(effectFn.scheduler){
            effectFn.scheduler()
        }
        else{
            effectFn.run()
        }
        // console.log("effectFn",effectFn);
    })
}

// 当前活跃的 effect
let activeEffect;

// 收集依赖的函数
export function effect(fn,options:any = {}){
    const scheduler = options.scheduler
    // 当我们调用 effect 的时候 ，执行里面的函数
    let _effect = new ReactiveEffect(fn,scheduler)
    
    // 执行函数
    _effect.run()

    return _effect.run.bind(_effect)
}