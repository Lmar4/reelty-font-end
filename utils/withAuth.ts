import { useAuth } from "../providers/AuthProvider";
import { ApiResponse, RequestOptions, AuthError, ApiError } from "./types";

// Global rate limit tracking
const rateLimitState = {
  isRateLimited: false,
  resetTime: 0,
  consecutiveErrors: 0,
  maxBackoff: 60000, // 1 minute max backoff
};

// Main request function for client-side with automatic token refresh
export async function makeBackendRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
  retryCount = 0
): Promise<T> {
  const { method = "GET", body, sessionToken, headers = {} } = options;
  const maxRetries = 3;

  // Ensure we have a valid backend URL
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new ApiError(500, "Backend URL is not configured");
  }

  const url = `${backendUrl}${endpoint}`;

  // Check global rate limit state
  const now = Date.now();
  if (rateLimitState.isRateLimited && now < rateLimitState.resetTime) {
    const waitTime = rateLimitState.resetTime - now;
    console.warn(`Rate limited, waiting ${waitTime}ms before trying again`);

    // If this is a critical request that can't wait, throw an error
    if (options.critical) {
      throw new ApiError(
        429,
        `Rate limited. Try again in ${Math.ceil(waitTime / 1000)} seconds.`
      );
    }

    // Wait for the backoff period
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  try {
    // Final token check
    if (!sessionToken) {
      throw new AuthError(401, "No valid session token available");
    }

    console.log(
      `Making ${method} request to ${endpoint} with token prefix: ${sessionToken.substring(
        0,
        10
      )}...`
    );

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
      mode: "cors",
    });

    // Handle response
    if (!response.ok) {
      // Handle rate limiting (429) errors specifically
      if (response.status === 429) {
        console.warn("Rate limiting detected, implementing backoff strategy");

        // Increment consecutive errors
        rateLimitState.consecutiveErrors++;

        // Calculate exponential backoff with jitter
        const baseDelay = Math.min(
          Math.pow(2, rateLimitState.consecutiveErrors) * 1000,
          rateLimitState.maxBackoff
        );
        // Add jitter (±20% randomness)
        const jitter = baseDelay * 0.2 * (Math.random() - 0.5);
        const delay = baseDelay + jitter;

        // Set global rate limit state
        rateLimitState.isRateLimited = true;
        rateLimitState.resetTime = now + delay;

        console.log(
          `Rate limited. Backing off for ${Math.round(delay)}ms. Retry ${
            retryCount + 1
          }/${maxRetries}`
        );

        // Try to get retry-after header for more accurate backoff
        const retryAfter = response.headers.get("retry-after");
        if (retryAfter) {
          const retryAfterMs = parseInt(retryAfter) * 1000;
          if (!isNaN(retryAfterMs) && retryAfterMs > 0) {
            rateLimitState.resetTime = now + retryAfterMs;
            console.log(`Using server retry-after: ${retryAfter}s`);
          }
        }

        // If we haven't exceeded max retries
        if (retryCount < maxRetries) {
          // Wait for the calculated delay
          await new Promise((resolve) => setTimeout(resolve, delay));

          // Get a fresh token
          let freshToken: string | null = null;

          // Try to get a token from the global window object if we're in a browser
          if (typeof window !== "undefined") {
            try {
              // Try to access the auth context through a custom event
              const event = new CustomEvent("auth:getToken", {
                detail: {
                  callback: (token: string) => {
                    freshToken = token;
                  },
                },
              });
              window.dispatchEvent(event);

              // If that didn't work, try to use Clerk directly if available
              if (!freshToken && (window as any).Clerk?.session) {
                freshToken = await (window as any).Clerk.session.getToken();
              }
            } catch (e) {
              console.error("Failed to get fresh token:", e);
            }
          }

          if (freshToken) {
            // Retry with fresh token
            return makeBackendRequest<T>(
              endpoint,
              { ...options, sessionToken: freshToken },
              retryCount + 1
            );
          }
        }
      }

      // Handle 401 errors specifically with automatic retry
      if (response.status === 401 && retryCount < maxRetries) {
        console.log(
          `Auth error, retrying (${retryCount + 1}/${maxRetries})...`
        );

        // Add delay before retry
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Get a fresh token - this needs to be done in a way that works outside of React components
        let freshToken: string | null = null;

        // Try to get a token from the global window object if we're in a browser
        if (typeof window !== "undefined") {
          try {
            // Try to access the auth context through a custom event
            const event = new CustomEvent("auth:getToken", {
              detail: {
                callback: (token: string) => {
                  freshToken = token;
                },
              },
            });
            window.dispatchEvent(event);

            // If that didn't work, try to use Clerk directly if available
            if (!freshToken && (window as any).Clerk?.session) {
              freshToken = await (window as any).Clerk.session.getToken();
            }
          } catch (e) {
            console.error("Failed to get fresh token:", e);
          }
        }

        if (freshToken) {
          // Retry with fresh token
          return makeBackendRequest<T>(
            endpoint,
            { ...options, sessionToken: freshToken },
            retryCount + 1
          );
        }
      }

      // Handle 401 errors specifically
      if (response.status === 401) {
        console.error(
          "Authentication failed - token may be expired or invalid"
        );

        // Only redirect if we're in the browser and we've exhausted retries
        if (typeof window !== "undefined" && retryCount >= maxRetries) {
          window.location.href =
            "/login?redirect=" + encodeURIComponent(window.location.pathname);
        }
        throw new AuthError(
          401,
          "Authentication failed - redirecting to login"
        );
      }

      // Handle other errors
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        try {
          const errorData = (await response.json()) as ApiResponse<any>;
          throw new AuthError(
            response.status,
            errorData.error || errorData.message || "Request failed"
          );
        } catch (parseError) {
          // If JSON parsing fails, use text response
          const text = await response.text();
          throw new AuthError(
            response.status,
            `Request failed: ${text.substring(0, 100)}...`
          );
        }
      }
      throw new AuthError(
        response.status,
        (await response.text()) || "Request failed"
      );
    }

    // Reset consecutive errors on success
    rateLimitState.consecutiveErrors = 0;
    rateLimitState.isRateLimited = false;

    // Check if response has content
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      // If not JSON or no content type, return empty object
      return {} as T;
    }

    try {
      // Only consume the body once
      const data = await response.json();
      return data as T;
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      throw new ApiError(500, "Failed to parse response from server");
    }
  } catch (error) {
    if (error instanceof AuthError || error instanceof ApiError) {
      throw error;
    }
    console.error("API request failed:", error);
    throw new ApiError(
      500,
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
}

// Enhanced useAuthenticatedRequest hook with automatic token refresh
export function useAuthenticatedRequest() {
  const auth = useAuth();

  return async <T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    // Wait for auth to be ready
    if (!auth.isLoaded) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Ensure we have authentication
    if (!auth.userId) {
      throw new AuthError(401, "User not authenticated");
    }

    // Try to use cached token if available and not expired
    let token: string | undefined;

    if (auth.isTokenValid && auth.isTokenValid() && auth.cachedToken) {
      token = auth.cachedToken;
      console.log("Using cached valid token");
    } else {
      // Otherwise get a fresh token
      console.log("Cached token invalid or missing, getting fresh token");
      try {
        // Try to use our refreshToken function first if available
        if (auth.refreshToken) {
          const refreshResult = await auth.refreshToken();
          if (
            refreshResult &&
            typeof refreshResult === "object" &&
            refreshResult.token
          ) {
            token = refreshResult.token;
          } else if (typeof refreshResult === "string") {
            token = refreshResult;
          }
        }

        // Fall back to getToken if refreshToken didn't work
        if (!token) {
          const freshToken = await auth.getToken({ skipCache: true });
          if (freshToken) {
            token = freshToken;
            console.log("Fresh token obtained");
          } else {
            console.error("Failed to get fresh token");
          }
        }
      } catch (error) {
        console.error("Error getting fresh token:", error);
        throw new AuthError(401, "Failed to obtain authentication token");
      }
    }

    if (!token) {
      console.error("No valid token available after refresh attempt");
      throw new AuthError(401, "No valid session token available");
    }

    // Log the token prefix for debugging
    console.log(
      `Making request to ${endpoint} with token prefix: ${token.substring(
        0,
        10
      )}...`
    );

    // Set up a listener for token refresh events
    if (typeof window !== "undefined") {
      window.addEventListener("auth:getToken", (e: any) => {
        if (
          e.detail &&
          e.detail.callback &&
          typeof e.detail.callback === "function"
        ) {
          if (auth.cachedToken) {
            e.detail.callback(auth.cachedToken);
          }
        }
      });
    }

    return makeBackendRequest<T>(endpoint, {
      ...options,
      sessionToken: token,
    });
  };
}

// Hook for checking authentication status
export function useIsAuthenticated() {
  const auth = useAuth();

  const checkAuth = async (): Promise<boolean> => {
    try {
      // Wait for auth to be ready
      if (!auth.isLoaded) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // If token is invalid, try to refresh it
      if (!auth.isTokenValid() && auth.refreshToken) {
        await auth.refreshToken();
      }

      const token = auth.cachedToken || (await auth.getToken());
      return !!(token && auth.userId);
    } catch {
      return false;
    }
  };

  return checkAuth;
}
