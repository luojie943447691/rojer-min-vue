const extend = Object.assign;
const isObject = (value) => {
    return value && typeof value === 'object';
};
const isArray = Array.isArray;

const targetMap = new Map();
// 触发依赖
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    if (!depsMap)
        return;
    const dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    dep.forEach(effectFn => {
        // 如果有 scheduler ，就不会执行 run 自身
        if (effectFn.scheduler) {
            effectFn.scheduler();
        }
        else {
            effectFn.run();
        }
        // console.log("effectFn",effectFn);
    });
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
// 是否只读
// 是否 只包含第一层
function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        let res = Reflect.get(target, key);
        // 如果是 shallow 
        if (isShallow) {
            return res;
        }
        // console.log("key", key);
        if (!isReadonly) {
            // 看得到的结果是否是 对象 ，如果是对象，则继续用 reactive 封装 
            res = isObject(res) ? reactive(res) : res;
        }
        else {
            res = isObject(res) ? readonly(res) : res;
        }
        // 
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const oldValue = Reflect.get(target, key);
        // 如果两个值相等 则不需要收集依赖
        if (oldValue !== value) {
            const res = Reflect.set(target, key, value);
            // 触发依赖
            trigger(target, key);
            return res;
        }
        return true;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`${key.toString()}是只读的`);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

/**
 *
 * @param raw 原始对象
 * @param isReadonly 是否只读
 * @returns
 */
function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
// 只读
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
// 浅只读
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function createActiveObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers);
}

const initEmits = (instance, name, ...args) => {
    // console.log("props",props);
    // console.log("name",args);
    const { props } = instance;
    // 组合 eventName 
    const handelKeys = (value) => {
        return value ? "on" + value.slice(0, 1).toUpperCase() + value.slice(1) : "";
    };
    const handleName = (value) => {
        return value.replace(/\-(\w)/, (_, c) => {
            return c.toUpperCase();
        });
    };
    const eventName = handelKeys(handleName(name));
    if (eventName in props) {
        props[eventName].apply(null, args);
    }
};

const initProps = (instance, rawProps) => {
    instance.props = rawProps || {};
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const PublicInstanceHandlers = {
    get(target, key, receiver) {
        // 处理 setup 中返回的数据
        const { setupState, props } = target;
        // 如果是在 setup 返回的数据中
        if (key in setupState) {
            return setupState[key];
        }
        else if (key in props) {
            return props[key];
        }
        // 如果在 指定的 $ 开头的数据中
        if (key in publicPropertiesMap) {
            return publicPropertiesMap[key](target);
        }
    }
};

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null
    };
    return vnode;
}

const initSlots = (instance, children) => {
    // instance.slots = isArray(children ) ? children : [children]
    const slots = {};
    for (const key in children) {
        const value = children[key];
        // S99 和 S100 是对应上的，由于需要传递 props 数据，故 slots[key] 只能是
        //     一个函数
        slots[key] = (props) => getArray(value(props));
    }
    instance.slots = slots;
};
// 注意这里的 props ，是由外边传进来的，
const renderSlot = (slots, name, props) => {
    // S100
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            // S101 本质上是调用 S99 的函数把数据传递进去的
            return createVNode("div", {}, slot(props));
        }
    }
};
const getArray = (value) => {
    return isArray(value) ? value : [value];
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        el: null,
        props: {},
        emit: () => { },
        slots: null
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // 在 instance.proxy 上创建一个代理对象，用于访问数据
    instance.proxy = new Proxy(instance, PublicInstanceHandlers);
    const { setup } = Component;
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props), {
            // 柯里化
            emit: initEmits.bind(null, instance)
        });
        handleSetupResult(instance, setupResult);
    }
}
// 处理 setup 的结果，并且把 setup 返回的数据赋值给 setupState 属性，用于
function handleSetupResult(instance, setupResult) {
    // function Object
    // TODO function
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    // if (Component.render) {
    // 我们假设全都有 render 
    instance.render = Component.render;
    // }
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    const { type } = vnode;
    // 只能是 component
    if (typeof type === 'string') {
        processElement(vnode, container);
    }
    else if (typeof type === 'object') {
        processComponent(vnode, container);
    }
}
// 处理 element 标签
function processElement(vnode, container, anchor = null) {
    // 首先处理 type 
    const { type, children } = vnode;
    // 创建标签
    const el = (vnode.el = document.createElement(type));
    // 判断 type 的类型
    if (typeof children === "string") {
        el.textContent = children;
    }
    // 如果是 数组
    else if (Array.isArray(children)) {
        mountChildren(children, el);
    }
    // 如果有 props 
    const { props } = vnode;
    for (const key in props) {
        const value = props[key];
        // 是否是事件
        const isOn = (name) => /^on[A-Z]/.test(name);
        if (isOn(key)) {
            const name = key.slice(2).toLocaleLowerCase();
            el.addEventListener(name, value);
        }
        else {
            el.setAttribute(key, value);
        }
    }
    setContent(container, el, anchor);
    // console.log(vnode);
    // console.log(container);
}
// 挂载 孩子节点
function mountChildren(children, el) {
    children.forEach(item => {
        patch(item, el);
    });
}
// 设置内容
function setContent(parent, children, anchor = null) {
    parent.insertBefore(children, anchor);
}
// 处理组件
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
// 挂载组件
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    // render 由于需要 this 用来访问 setup 的数据
    // 结构出 proxy 数据 
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    // 尤其要注意这里 helloworld 文件夹，是否能访问到 $el 的关键所在
    // 当 element 节点处理完成之后，当前虚拟节点的 el 就可以赋值了
    vnode.el = subTree.el;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h, renderSlot };
