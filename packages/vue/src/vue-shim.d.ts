declare module 'vue' {
  export function ref<T>(value: T): { value: T };
  export function computed<T>(getter: () => T): { value: T };
  export function onMounted(fn: () => void | Promise<void>): void;
  export function onBeforeUnmount(fn: () => void): void;
  export function withDefaults<T>(props: T, defaults: Partial<T>): T;
  export function defineProps<T>(): T;
  export type Ref<T> = { value: T };
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
