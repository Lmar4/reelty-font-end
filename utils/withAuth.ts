import { makeBackendRequest as baseRequest, type BackendResponse } from './api';

export type { BackendResponse };

export async function makeAuthenticatedRequest<T>(
  endpoint: string,
  {
    method = "GET",
    body,
    sessionToken,
    timeout = 30000,
    retryCount = 3,
  }: {
    method?: string;
    body?: any;
    sessionToken: string;
    timeout?: number;
    retryCount?: number;
  }
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error | null = null;
  let attempts = 0;

  while (attempts < retryCount) {
    try {
      // Log the request details (remove in production)
      console.debug("[REQUEST]", {
        endpoint,
        method,
        hasToken: !!sessionToken,
        tokenPreview: sessionToken ? `${sessionToken.slice(0, 10)}...` : null,
      });

      // Use the base request with our auth headers
      const response = await baseRequest<T>(endpoint, {
        method,
        body,
        sessionToken,
        timeout,
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error("An unexpected error occurred");

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timed out. Please try again.");
        }

        // Don't retry on session expiration
        if (error.message === "Session expired or invalid") {
          throw error;
        }

        // Log errors in development
        console.error("[REQUEST_ERROR]", {
          endpoint,
          error: error.message,
          attempt: attempts + 1,
          maxAttempts: retryCount,
        });
      }

      attempts++;
      if (attempts === retryCount) {
        throw lastError;
      }

      // Exponential backoff
      const backoffTime = Math.pow(2, attempts) * 1000;
      console.debug(`[RETRY] Waiting ${backoffTime}ms before retry ${attempts + 1}/${retryCount}`);
      await new Promise((resolve) => setTimeout(resolve, backoffTime));
    }
  }

  throw lastError || new Error("Request failed after all retries");
}

// Export the authenticated version as the default makeBackendRequest
export const makeBackendRequest = makeAuthenticatedRequest;

// Re-export types and functions from withAuthServer
export { withAuth, type AuthenticatedRequest } from "./withAuthServer";
