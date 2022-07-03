const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};

export const PublicInstanceHandlers = {
    get(target, key, receiver) {
        // 处理 setup 中返回的数据
        const { setupState,props } = target
        // 如果是在 setup 返回的数据中
        if (key in setupState) {
            return setupState[key]
        }
        else if(key in props){
            return props[key]
        }
        // 如果在 指定的 $ 开头的数据中
        if (key in publicPropertiesMap) {
            return publicPropertiesMap[key](target)
        }
    }
}