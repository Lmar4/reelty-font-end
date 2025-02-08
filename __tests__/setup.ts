vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { expect, afterEach, vi } from "vitest";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Polyfill matchMedia if not available
if (!globalThis.matchMedia) {
  Object.defineProperty(globalThis, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Polyfill ResizeObserver if not available
if (!globalThis.ResizeObserver) {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserver;
}

// Polyfill URL.createObjectURL and URL.revokeObjectURL if not available
if (!globalThis.URL.createObjectURL) {
  globalThis.URL.createObjectURL = vi.fn();
}
if (!globalThis.URL.revokeObjectURL) {
  globalThis.URL.revokeObjectURL = vi.fn();
}

// Polyfill requestAnimationFrame and cancelAnimationFrame if needed
if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = function (
    callback: FrameRequestCallback
  ): number {
    return setTimeout(() => callback(Date.now()), 0) as unknown as number;
  };
}
if (!globalThis.cancelAnimationFrame) {
  globalThis.cancelAnimationFrame = function (id: number): void {
    clearTimeout(id);
  };
}

// Polyfill MutationObserver if not available
if (!globalThis.MutationObserver) {
  class MutationObserver {
    observe() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  globalThis.MutationObserver = MutationObserver;
}

// Polyfill DOMRect if not available
if (!globalThis.DOMRect) {
  class DOMRectImpl {
    bottom = 0;
    height = 0;
    left = 0;
    right = 0;
    top = 0;
    width = 0;
    x = 0;
    y = 0;
    toJSON() {
      return this;
    }
  }
  globalThis.DOMRect = class DOMRect extends DOMRectImpl {
    static fromRect(other?: DOMRectInit): DOMRect {
      const rect = new DOMRect();
      if (other) {
        rect.x = other.x ?? 0;
        rect.y = other.y ?? 0;
        rect.width = other.width ?? 0;
        rect.height = other.height ?? 0;
        rect.top = rect.y;
        rect.right = rect.x + rect.width;
        rect.bottom = rect.y + rect.height;
        rect.left = rect.x;
      }
      return rect;
    }
  } as unknown as typeof DOMRect;
}

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
