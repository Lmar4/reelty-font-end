import "@testing-library/jest-dom";
import React from "react";

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
};

const mockSearchParams = {
  get: jest.fn(),
};

const mockToast = {
  error: jest.fn(),
  success: jest.fn(),
};

// Mock modules
jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

jest.mock("sonner", () => ({
  toast: mockToast,
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return React.createElement("img", { ...props });
  },
}));
