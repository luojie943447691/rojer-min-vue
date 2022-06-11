import { mutableHandlers,readonlyHandlers } from "./baseHandler";

/**
 * 
 * @param raw 原始对象
 * @param isReadonly 是否只读
 * @returns 
 */
export function reactive(raw) {
    return createActiveObject(raw, mutableHandlers)
}

// 只读
export function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers)
}


function createActiveObject(raw,baseHandlers){
    return new Proxy(raw, baseHandlers)
}
