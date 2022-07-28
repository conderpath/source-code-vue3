import { TrackOpTypes, TriggerOpTypes } from "./operations";

// 激活的effect
let activeEffect: ReactiveEffect | undefined;
// 依赖收集
const targetMap = new WeakMap();

class ReactiveEffect {
  // effect的parent effect
  public parent: ReactiveEffect | undefined = undefined;
  public deps: ReactiveEffect[] = [];
  // 是否激活状态
  public active = true;
  constructor(public fn: Function, public schedule?: Function) {}
  run() {
    // 执行effect
    // 非激活状态下，只需要执行函数，不需要进行依赖收集
    if (!this.active) {
      return this.fn();
    }
    // 进行依赖收集，将当前的effect和稍后需要的属性关联在一起
    try {
      // 之前运行的effect为父节点，确认嵌套执行的effect能正确执行
      this.parent = activeEffect;
      activeEffect = this;
      return this.fn();
    } finally {
      // activeEffect = undefined;
      activeEffect = this.parent;
      this.parent = undefined;
    }
  }
}

// fn可以根据状态变化之后重新执行，effect可以嵌套
export function effect(fn: Function) {
  const _effect = new ReactiveEffect(fn);
  //默认先执行一次
  _effect.run();
}
/**
 * 依赖收集
 * @param target
 * @param key
 * {
 *  '对象': {
 *    '属性1': Set1,
 *    '属性2': Set2
 * }
 * }
 */
export function track(target: object, type: TrackOpTypes, key: unknown) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  let shouldTrack = !dep.has(activeEffect); // 去重
  /**
   * 既需要记录属性和effect之间的记录（属性变化了重新执行effect）
   * 同时effect需要反向记录属性收集了哪些依赖，这样进行清理时需要用到
   */
  if (shouldTrack) {
    dep.add(activeEffect);
    // effect中记录dep
    activeEffect.deps.push(dep);
  }
}
export function trigger(
  target: object,
  type: TriggerOpTypes,
  key: string | symbol
) {
  const depsMap = targetMap.get(target); // {obj: {a:Set()}}
  if (!depsMap) return; // 修改的属性  没有依赖任何effect 直接return
  const deps = [];
  deps.push(depsMap.get(key));
  let effects: Array<ReactiveEffect> = [];
  for (const dep of deps) {
    effects.push(...dep);
  }
  triggerEffects(effects);
}

function triggerEffects(effects: Array<ReactiveEffect>) {
  if (effects && effects.length) {
    for (let effect of effects) {
      // 当前执行的effect和需要执行的effect不是同一个时才执行，防止死循环
      if (effect !== activeEffect) {
        if (effect.schedule) {
          return effect.schedule();
        } else {
          effect.run();
        }
      }
    }
  }
}
