import {  shallowReadonly } from "../reactivity/reactive";
import { initEmits } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode) {
    const component = {
      vnode,
      type: vnode.type,
      setupState:{},
      el: null,
      props:{}
    };
  
    return component;
  }
  
  export function setupComponent(instance) {
    // TODO
    initProps(instance,instance.vnode.props)
    // initSlots()
    setupStatefulComponent(instance);
  }

  function setupStatefulComponent(instance: any) {
    const Component = instance.type;

    // 在 instance.proxy 上创建一个代理对象，用于访问数据
    instance.proxy = new Proxy(instance,PublicInstanceHandlers)
  
    const { setup } = Component;
  
    if (setup) {
      const setupResult = setup(shallowReadonly(instance.props),{
        // 柯里化
        emit:initEmits.bind(null,instance)
      });
  
      handleSetupResult(instance, setupResult);
    }
  }
  
  // 处理 setup 的结果，并且把 setup 返回的数据赋值给 setupState 属性，用于
  function handleSetupResult(instance, setupResult: any) {
    // function Object
    // TODO function
    if (typeof setupResult === "object") {
      instance.setupState = setupResult;
    }
  
    finishComponentSetup(instance);
  }
  
  function finishComponentSetup(instance: any) {
    const Component = instance.type;
    // if (Component.render) {
    // 我们假设全都有 render 
    instance.render = Component.render;
    // }
  }