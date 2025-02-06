import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";

interface ErrorHandlerOptions {
  fallbackMessage?: string;
  showToast?: boolean;
  onError?: (error: unknown) => void;
}

export const handleError = (
  error: unknown,
  options: ErrorHandlerOptions = {}
): string => {
  const {
    fallbackMessage = "An unexpected error occurred",
    showToast = true,
    onError,
  } = options;

  let errorMessage = fallbackMessage;
  let errorType: "error" | "warning" = "error";

  if (error instanceof TRPCClientError) {
    errorMessage = error.message;
    if (isPlanLimitError(error)) {
      errorType = "warning";
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  if (showToast) {
    toast[errorType](errorMessage);
  }

  onError?.(error);

  return errorMessage;
};

export const isAuthError = (error: unknown): boolean => {
  if (error instanceof TRPCClientError) {
    return (
      error.data?.code === "UNAUTHORIZED" ||
      error.message.toLowerCase().includes("unauthorized") ||
      error.message.toLowerCase().includes("unauthenticated")
    );
  }
  return false;
};

export const isPlanLimitError = (error: unknown): boolean => {
  if (error instanceof TRPCClientError) {
    return (
      error.message.toLowerCase().includes("plan limit") ||
      error.message.toLowerCase().includes("upgrade") ||
      error.message.toLowerCase().includes("subscription")
    );
  }
  return false;
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.toLowerCase().includes("network") ||
      error.message.toLowerCase().includes("connection") ||
      error.message.toLowerCase().includes("offline")
    );
  }
  return false;
};

export const isValidationError = (error: unknown): boolean => {
  if (error instanceof TRPCClientError) {
    return (
      error.data?.code === "BAD_REQUEST" ||
      error.message.toLowerCase().includes("validation") ||
      error.message.toLowerCase().includes("invalid")
    );
  }
  return false;
};

export const isServerError = (error: unknown): boolean => {
  if (error instanceof TRPCClientError) {
    return (
      error.data?.code === "INTERNAL_SERVER_ERROR" ||
      error.message.toLowerCase().includes("server error") ||
      error.message.toLowerCase().includes("internal error")
    );
  }
  return false;
};

export const getErrorCode = (error: unknown): string | undefined => {
  if (error instanceof TRPCClientError) {
    return error.data?.code;
  }
  return undefined;
};

export const getErrorData = (error: unknown): unknown => {
  if (error instanceof TRPCClientError) {
    return error.data;
  }
  return undefined;
};
