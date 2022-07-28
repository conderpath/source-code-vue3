import { track, trigger } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./operations";
import { ReactiveFlags, Target } from "./reactive";

export const mutableHandlers = {
  get(target: Target, key: string | symbol, receiver: object) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    // 获取值时 进行依赖收集
    track(target, TrackOpTypes.GET, key);
    return Reflect.get(target, key, receiver);
  },
  set(target: Target, key: string | symbol, value: any, receiver: object) {
    let oldValue = (target as any)[key];
    Reflect.set(target, key, value, receiver);
    // 新旧值不相等时，进行更新
    if (oldValue !== value) {
      // 设置值时进行依赖更新
      trigger(target, TriggerOpTypes.SET, key);
    }
    return true;
  },
};
