import { track, trigger } from "./effect"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly = false) {
    return function get(target, key) {
        const res = Reflect.get(target, key)
        if (!isReadonly) {
            // 收集依赖
            track(target, key)
        }
        return res
    }
}

function createSetter(){
    return function set(target, key, value){
        const res = Reflect.set(target, key, value)
        // 触发依赖
        trigger(target, key)
        return res
    }
}

export const mutableHandlers = {
    get:get,
    set:createSetter()
}

export const readonlyHandlers = {
    get:readonlyGet,
    set(target, key, value) {
        console.warn(`${key.toString()}是只读的`);
        return true
    }
}