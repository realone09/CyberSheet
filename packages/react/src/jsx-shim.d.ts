// Minimal JSX namespace shim to allow building without @types/react installed.
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
