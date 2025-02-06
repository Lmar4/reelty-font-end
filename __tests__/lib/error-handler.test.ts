/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TRPCClientError } from "@trpc/client";
import { toast } from "sonner";
import type { TRPCClientErrorLike } from "@trpc/client";
import {
  handleError,
  isAuthError,
  isPlanLimitError,
  isNetworkError,
  isValidationError,
  isServerError,
  getErrorCode,
  getErrorData,
} from "@/lib/error-handler";

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("error-handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleError", () => {
    it("handles TRPCClientError", () => {
      const error = new TRPCClientError("TRPC error");
      (error as any).data = { code: "INTERNAL_SERVER_ERROR" };
      const result = handleError(error);
      expect(result).toBe("TRPC error");
      expect(toast.error).toHaveBeenCalledWith("TRPC error");
    });

    it("handles plan limit error as warning", () => {
      const error = new TRPCClientError("Plan limit exceeded");
      (error as any).data = { code: "PLAN_LIMIT" };
      handleError(error);
      expect(toast.warning).toHaveBeenCalledWith("Plan limit exceeded");
    });

    it("handles regular Error", () => {
      const error = new Error("Regular error");
      const result = handleError(error);
      expect(result).toBe("Regular error");
      expect(toast.error).toHaveBeenCalledWith("Regular error");
    });

    it("uses fallback message for unknown errors", () => {
      const result = handleError(null);
      expect(result).toBe("An unexpected error occurred");
      expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred");
    });

    it("respects showToast option", () => {
      handleError(new Error("Test"), { showToast: false });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("calls onError callback if provided", () => {
      const onError = vi.fn();
      const error = new Error("Test");
      handleError(error, { onError });
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  describe("error type checks", () => {
    it("identifies auth errors", () => {
      const error = new TRPCClientError("Unauthorized access");
      (error as any).data = { code: "UNAUTHORIZED" };
      expect(isAuthError(error)).toBe(true);
      expect(isAuthError(new Error("regular error"))).toBe(false);
    });

    it("identifies plan limit errors", () => {
      const error = new TRPCClientError("Plan limit exceeded");
      (error as any).data = { code: "PLAN_LIMIT" };
      expect(isPlanLimitError(error)).toBe(true);
      expect(isPlanLimitError(new Error("regular error"))).toBe(false);
    });

    it("identifies network errors", () => {
      const error = new Error("Network connection failed");
      expect(isNetworkError(error)).toBe(true);
      expect(isNetworkError(new Error("regular error"))).toBe(false);
    });

    it("identifies validation errors", () => {
      const error = new TRPCClientError("Invalid input");
      (error as any).data = { code: "BAD_REQUEST" };
      expect(isValidationError(error)).toBe(true);
      expect(isValidationError(new Error("regular error"))).toBe(false);
    });

    it("identifies server errors", () => {
      const error = new TRPCClientError("Internal server error");
      (error as any).data = { code: "INTERNAL_SERVER_ERROR" };
      expect(isServerError(error)).toBe(true);
      expect(isServerError(new Error("regular error"))).toBe(false);
    });
  });

  describe("error data extraction", () => {
    it("gets error code", () => {
      const error = new TRPCClientError("Test error");
      (error as any).data = { code: "CUSTOM_CODE" };
      expect(getErrorCode(error)).toBe("CUSTOM_CODE");
      expect(getErrorCode(new Error("regular error"))).toBeUndefined();
    });

    it("gets error data", () => {
      const errorData = { code: "TEST", details: "test details" };
      const error = new TRPCClientError("Test error");
      (error as any).data = errorData;
      expect(getErrorData(error)).toEqual(errorData);
      expect(getErrorData(new Error("regular error"))).toBeUndefined();
    });
  });
});
