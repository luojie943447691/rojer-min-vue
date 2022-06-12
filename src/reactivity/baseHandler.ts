import { isObject } from "../shared/utils"
import { track, trigger } from "./effect"
import { reactive, ReactiveFlags, readonly } from "./reactive"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly = false) {
    return function get(target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }
        let res = Reflect.get(target, key)
        // console.log("key", key);
        if (!isReadonly) {
            // 看得到的结果是否是 对象 ，如果是对象，则继续用 reactive 封装 
            res = isObject(res) ? reactive(res) : res
            // 收集依赖
            track(target, key)
        }
        else{
            res = isObject(res) ? readonly(res) : res
        }

        // 

        return res
    }
}

function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value)
        // 触发依赖
        trigger(target, key)
        return res
    }
}

export const mutableHandlers = {
    get,
    set
}

export const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`${key.toString()}是只读的`);
        return true
    }
}