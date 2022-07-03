import { isArray } from "../shared/utils"
import { createVNode } from "./vnode"


export const initSlots = (instance, children) => {
    // instance.slots = isArray(children ) ? children : [children]
    const slots = {}
    for (const key in children) {
        const value = children[key]
        // S99 和 S100 是对应上的，由于需要传递 props 数据，故 slots[key] 只能是
        //     一个函数
        slots[key] = (props) => getArray(value(props))
    }
    instance.slots = slots
}

// 注意这里的 props ，是由外边传进来的，
export const renderSlot = (slots, name, props) => {
    // S100
    const slot = slots[name]
    if (slot) {
        if (typeof slot === 'function') {
            // S101 本质上是调用 S99 的函数把数据传递进去的
            return createVNode("div", {}, slot(props))
        }
    }
}

const getArray = (value) => {
    return isArray(value) ? value : [value]
}



