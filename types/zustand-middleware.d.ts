/* Minimal fallback typings for zustand sub-path that TS 5 bundler resolution fails to pick up. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare module 'zustand/middleware' {
  export const devtools: any;
  export const persist: any;
  export const createJSONStorage: any;
}