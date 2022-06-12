import { ReactiveEffect } from "./effect"


class WatchImpl{
    _effect:any
    _getter  = () => {}
    _job = () => {}
    constructor(source,callback,options){

        if(typeof source === "function"){
            this._getter = source
        }
        else{ 
            // 直接传递对象 我们需要读取所有属性 用于收集依赖
            this._getter = () => recurve(source)
        }

        const effect = new ReactiveEffect(this._getter,() =>{
            const p = Promise.resolve()
            p.then(_ => {
                this._job()
            })
        })

        let oldValue,newValue
        this._job = () =>{
            // 执行 run 之后得到返回值 
            newValue = effect.run()
            // 调用 callback 
            callback(oldValue,newValue)
            // 每次值被更新的时候，要把最新的值赋值给 旧的值
            oldValue = newValue
        }

        if(options.immediate){
            this._job()
        }else{
            // 执行 并 收集依赖
            oldValue = effect.run()
        }
    }
}

// 作用是读取所有属性 
function recurve(value, seen = new Set()) {
    if (value === null || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value)

    for (const k in value) {
        recurve(value[k], seen)
    }
    return value;
}

export function watch(source,fn,options:any = {}){
    return new WatchImpl(source,fn,options)
}