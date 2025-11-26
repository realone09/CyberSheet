declare module 'svelte/store' {
  export interface Writable<T> {
    subscribe(fn: (value: T) => void): () => void;
    set(value: T): void;
    update(fn: (value: T) => T): void;
  }
  export function writable<T>(value: T): Writable<T>;
}

declare module 'svelte' {
  export function onMount(fn: () => void | Promise<void>): void;
  export function onDestroy(fn: () => void): void;
}

declare module '*.svelte' {
  const component: any;
  export default component;
}
