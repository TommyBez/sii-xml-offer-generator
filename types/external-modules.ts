/* eslint-disable @typescript-eslint/no-explicit-any */
export {};
/**
 * Ambient declarations for external modules that don't ship their own
 * type definitions (or where the bundled types are not picked up by
 * the current TypeScript configuration).
 */

declare module 'zustand/middleware' {
  export const devtools: (...args: any[]) => any;
  export const persist: (...args: any[]) => any;
  export const createJSONStorage: (...args: any[]) => any;
}

declare module 'zustand/middleware/immer' {
  export const immer: (...args: any[]) => any;
}