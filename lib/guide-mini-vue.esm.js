const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const PublicInstanceHandlers = {
    get(target, key, receiver) {
        // 处理 setup 中返回的数据
        const { setupState } = target;
        // 如果是在 setup 返回的数据中
        if (key in setupState) {
            return setupState[key];
        }
        // 如果在 指定的 $ 开头的数据中
        if (key in publicPropertiesMap) {
            return publicPropertiesMap[key](target);
        }
    }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        el: null
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // 在 instance.proxy 上创建一个代理对象，用于访问数据
    instance.proxy = new Proxy(instance, PublicInstanceHandlers);
    const { setup } = Component;
    if (setup) {
        const setupResult = setup();
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
    const subTree = instance.render.apply(proxy);
    patch(subTree, container);
    // 尤其要注意这里 helloworld 文件夹，是否能访问到 $el 的关键所在
    // 当 element 节点处理完成之后，当前虚拟节点的 el 就可以赋值了
    vnode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null
    };
    return vnode;
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

export { createApp, h };
