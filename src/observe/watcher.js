let id = 0; // 不同组件有不同的watcher
import Dep, { pushTarget, popTarget } from "./dep";

// 观察者模式
// 每个属性有一个dep(属性就是被观察者), watcher就是观察者(属性变化了会通知观察者来更新)
class Watcher {
  constructor(vm, exprOrFn, options, cb) {
    this.id = id++; // 每个watcher都有一个唯一的id

    this.renderWatcher = options; // 是否是渲染watcher

    if (typeof exprOrFn === "string") {
      this.getter = function () {
        return vm[exprOrFn];
      };
    } else {
      this.getter = exprOrFn; // 渲染watcher的回调
    }

    this.deps = []; // 存储dep, 后续实现计算属性, 和一些清理工作需要

    this.depsId = new Set();

    this.lazy = options.lazy; // 是否是计算属性

    this.cb = cb; // 用户watcher的回调

    this.dirty = this.lazy; // 计算属性是否需要重新计算

    this.vm = vm;

    this.user = options.user; // 是否是用户watcher

    this.value = this.lazy ? undefined : this.get();
  }

  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      // 去重
      this.depsId.add(id);
      this.deps.push(dep); // 将dep添加到watcher中
      dep.addSub(this); // 将watcher添加到dep中
    }
  }

  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }

  get() {
    pushTarget(this);
    const value = this.getter.call(this.vm);
    popTarget();
    return value;
  }

  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend(); // 让计算属性watcher也收集渲染watcher
    }
  }

  update() {
    if (this.lazy) {
      this.dirty = true;
    } else {
      queueWatcher(this); // 将watcher放入队列中
    }
  }

  run() {
    const oldValue = this.value;
    const newValue = this.get();

    if (this.user) {
      this.cb.call(this.vm, newValue, oldValue);
    }
  }
}

let queue = []; // 队列
let has = {}; // 去重
let pending = false; // 是否正在刷新队列

function flushSchedulerQueue() {
  let flushQueue = queue.slice(0);
  queue = [];
  has = {};
  pending = false;
  flushQueue.forEach((q) => q.run());
}

function queueWatcher(watcher) {
  const id = watcher.id;
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;

    if (!pending) {
      nextTick(flushSchedulerQueue, 0);
      pending = true;
    }
  }
}

let callbacks = [];
let waiting = false;

function flushCallbacks() {
  let cbs = callbacks.slice(0);
  waiting = false;
  callbacks = [];
  cbs.forEach((cb) => cb());
}

let timerFunc;
if (Promise) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks);
  };
} else if (MutationObserver) {
  let observer = new MutationObserver(flushCallbacks);
  let textNode = document.createTextNode(1);
  observer.observe(textNode, {
    characterData: true,
  });
  timerFunc = () => {
    textNode.textContent = 2;
  };
} else if (setImmediate) {
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks);
  };
}

export function nextTick(cb) {
  callbacks.push(cb);
  if (!waiting) {
    timerFunc();
    waiting = true;
  }
}

export default Watcher;
