import { isObject } from "@vue3/shared";
import { mutableHandlers } from "./baseHandler";
const reactiveMap = new WeakMap();

// 响应式的一些标识
export const enum ReactiveFlags {
  SKIP = "__v_skip",
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
  IS_SHALLOW = "__v_isShallow",
  RAW = "__v_raw",
}

export interface Target {
  [ReactiveFlags.SKIP]?: boolean;
  [ReactiveFlags.IS_REACTIVE]?: boolean;
  [ReactiveFlags.IS_READONLY]?: boolean;
  [ReactiveFlags.IS_SHALLOW]?: boolean;
  [ReactiveFlags.RAW]?: any;
}
// 将数据转化为响应式对象，只能针对对象
export function reactive(target: Target) {
  if (!isObject(target)) {
    console.warn(`${target} must be object`);
    return target;
  }
  //1. 如果对象已经代理过，直接返回
  let exitingProxy = reactiveMap.get(target);
  if (exitingProxy) {
    return exitingProxy;
  }

  //2. 对象本身就是响应式的
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }
  const proxy = new Proxy(target, mutableHandlers);
  // 缓存代理对象
  reactiveMap.set(target, proxy);
  return proxy;
}

/**
 * 1. 对一个对象重复代理，需要保证state1 === state2
 * let obj = {age: 10}
 * const state1 = reactive(obj)
 * const state2 = reactive(obj)
 * 2. 本身就已经是响应式对象了
 * const state1 = reactive({age: 10})
 * const state2 = reactive(state1)
 *
 *
 */
