import { toast } from "sonner";

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

class TimeoutError extends Error {
  constructor(message = "Request timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

export const fetchWithRetry = async <T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> => {
  const {
    timeout = 30000, // 30 seconds default timeout
    retries = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;

      if (error instanceof Error && error.name === "AbortError") {
        throw new TimeoutError();
      }

      if (attempt === retries - 1) {
        break;
      }

      // Show retry toast
      toast.error(`Request failed, retrying... (${attempt + 1}/${retries})`);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError;
};

export const api = {
  get: <T>(url: string, options?: FetchOptions) =>
    fetchWithRetry<T>(url, { ...options, method: "GET" }),

  post: <T>(url: string, data?: unknown, options?: FetchOptions) =>
    fetchWithRetry<T>(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(data),
    }),

  put: <T>(url: string, data?: unknown, options?: FetchOptions) =>
    fetchWithRetry<T>(url, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(data),
    }),

  delete: <T>(url: string, options?: FetchOptions) =>
    fetchWithRetry<T>(url, { ...options, method: "DELETE" }),
};
