/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
import { enableMapSet } from "immer";

enableMapSet();

// Mock ResizeObserver for components that use it (e.g., HeroUI components)
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.assign(globalThis, { ResizeObserver: MockResizeObserver });

// Mock localStorage for Zustand persist middleware
const localStorageMock = {
  getItem: (_key: string): string | null => null,
  setItem: (_key: string, _value: string): void => {},
  removeItem: (_key: string): void => {},
  clear: (): void => {},
  length: 0,
  key: (_index: number): string | null => null,
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});
