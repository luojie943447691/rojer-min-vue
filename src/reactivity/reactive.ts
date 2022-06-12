import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandler";

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
// 浅只读
export function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers)
}

export function isReactive(value) {
    return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY];
}

export function isProxy(value) {
    return isReactive(value) || isReadonly(value)
}

function createActiveObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers)
}
