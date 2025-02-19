export interface BackendResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function makeBackendRequest<T>(
  endpoint: string,
  {
    method = "GET",
    body,
    sessionToken,
    timeout = 30000, // 30 second default timeout
    retryCount = 3, // Add retry count
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
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const url = `${backendUrl}${endpoint}`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        attempts++;
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle session expiration
        if (
          response.status === 401 &&
          errorData.error === "Invalid or missing session"
        ) {
          console.warn(
            "[AUTH_WARNING] Session expired, please refresh the page"
          );
          throw new Error("Session expired");
        }

        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data as T;
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
        if (error.message === "Session expired") {
          throw error;
        }
      }

      attempts++;
      if (attempts === retryCount) {
        throw lastError;
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempts) * 1000)
      );
    }
  }

  throw lastError || new Error("Request failed after all retries");
}

// Re-export types and functions from withAuthServer
export { withAuth, type AuthenticatedRequest } from "./withAuthServer";
