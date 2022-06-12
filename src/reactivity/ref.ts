import { isObject } from "../shared/utils";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";


class RefImpl {
    public _value;
    public _raw;
    public dep;
    public __is_ref = true;
    constructor(value) {
        this._value =  convert(value)
        this._raw = value
        this.dep = new Set()
    }

    get value() {
        if (isTracking()) {
            // 收集依赖
            trackEffects(this.dep)
        }

        return this._value
    }

    set value(newValue) {
        if (this._raw === newValue) return;
        this._value = convert(newValue)
        this._raw = newValue
        // 触发依赖
        triggerEffects(this.dep)
    }
}

function convert(value){
    return isObject(value) ? reactive(value) : value
}

export function ref(value) {
    return new RefImpl(value)
}

export function isRef(value) {
    return !!value["__is_ref"]
}

export function unRef(value) {
    return isRef(value) ? value.value : value
}


export function proxyRefs(value) {
    return new Proxy(value, {
        get(target, key, receiver) {
            // 获取值
            const res = unRef(Reflect.get(target, key, receiver))

            return res
        },
        set(target, key, value, receiver) {
            // 如果新值不是 ref 而旧值是 ref
            const oldValue = Reflect.get(target, key,receiver)
            if(!isRef(value) && isRef(oldValue)){
                return oldValue.value = value
            }
            else{
                return Reflect.set(target, key, value, receiver)
            }
        }
    })
}