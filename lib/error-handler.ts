import { toast } from "sonner";

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

  if (error instanceof Error) {
    errorMessage = error.message;
    if (isPlanLimitError(error)) {
      errorType = "warning";
    }
  }

  if (showToast) {
    toast[errorType](errorMessage);
  }

  onError?.(error);

  return errorMessage;
};

export const isAuthError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("unauthorized") ||
      message.includes("unauthenticated") ||
      message.includes("not authenticated")
    );
  }
  return false;
};

export const isPlanLimitError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("plan limit") ||
      message.includes("upgrade") ||
      message.includes("subscription")
    );
  }
  return false;
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("network") ||
      message.includes("connection") ||
      message.includes("offline")
    );
  }
  return false;
};

export const isValidationError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("validation") ||
      message.includes("invalid") ||
      message.includes("bad request")
    );
  }
  return false;
};

export const isServerError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("server error") ||
      message.includes("internal error") ||
      message.includes("500")
    );
  }
  return false;
};

export const getErrorCode = (error: unknown): string | undefined => {
  if (error instanceof Error) {
    return error.message.split(" ")[1];
  }
  return undefined;
};

export const getErrorData = (error: unknown): unknown => {
  if (error instanceof Error) {
    return error.message.split(" ").slice(2).join(" ");
  }
  return undefined;
};
