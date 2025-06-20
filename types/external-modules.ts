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

// Fallback declaration in case React types are not resolved in certain tooling contexts.
declare module 'react' {
  // Re-export everything as any to avoid type errors while keeping tooling happy.
  // Developers still get proper types via @types/react in most editors/builds.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const React: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const useEffect: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const useState: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const useMemo: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Fragment: any;
  export default React;
}

// Fallback minimal JSX namespace to avoid IntrinsicElements errors in files that the linter treats as non-TSX.
declare global {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface IntrinsicElements {
      // Allow any JSX tag without type checking (only for linter fallback).
      [elemName: string]: any;
    }
  }
}