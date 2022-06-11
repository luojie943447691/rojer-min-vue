import { mutableHandlers,readonlyHandlers } from "./baseHandler";

export const enum ReactiveFlags {
    IS_REACTIVE = "__v_isReactive",
    IS_READONLY = "__v_isReadonly",
  }

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

export function isReactive(value) {
    return !!value[ReactiveFlags.IS_REACTIVE];
  }
  
  export function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY];
  }

function createActiveObject(raw,baseHandlers){
    return new Proxy(raw, baseHandlers)
}
