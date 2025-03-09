import { useAuth } from "../providers/AuthProvider";
import { makeBackendRequest } from "./withAuth";
import { AuthError, RequestOptions } from "./types";

// Global token cache with expiration
interface TokenCacheEntry {
  token: string;
  expiresAt: number;
}

// Shared token cache across all components
const tokenCache: Record<string, TokenCacheEntry> = {};

// Token refresh lock to prevent multiple simultaneous refreshes
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Custom hook for making authenticated requests in components
export function useAuthenticatedRequest() {
  const auth = useAuth();

  // Function to get a valid token with optimized caching
  const getValidToken = async (): Promise<string> => {
    const userId = auth.userId;
    if (!userId) {
      throw new AuthError(401, "User not authenticated");
    }

    // Check if we have a valid cached token
    const now = Date.now();
    const cachedEntry = tokenCache[userId];

    if (cachedEntry && now < cachedEntry.expiresAt - 30000) {
      // 30s buffer
      console.log("Using globally cached token");
      return cachedEntry.token;
    }

    // If auth context has a valid token, use it
    if (auth.isTokenValid && auth.isTokenValid() && auth.cachedToken) {
      // Update global cache with this token
      if (auth.tokenExpiresAt) {
        tokenCache[userId] = {
          token: auth.cachedToken,
          expiresAt: auth.tokenExpiresAt,
        };
      }
      console.log("Using auth context cached token");
      return auth.cachedToken;
    }

    // If a refresh is already in progress, wait for it
    if (isRefreshing && refreshPromise) {
      console.log("Token refresh already in progress, waiting...");
      const token = await refreshPromise;
      if (token) return token;
    }

    // Otherwise get a fresh token with lock to prevent multiple refreshes
    console.log("Getting fresh token");
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        // Add small random delay to prevent thundering herd problem
        const randomDelay = Math.random() * 200; // 0-200ms
        await new Promise((resolve) => setTimeout(resolve, randomDelay));

        const freshToken = await auth.getToken({ skipCache: true });

        if (freshToken) {
          console.log("Fresh token obtained");

          // Parse token to get expiration
          try {
            const base64Url = freshToken.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split("")
                .map(function (c) {
                  return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join("")
            );
            const payload = JSON.parse(jsonPayload);
            // Set expiry to actual token expiry minus 1 minute for safety margin
            const expiresAt = payload.exp * 1000 - 60000;

            // Update global cache
            tokenCache[userId] = { token: freshToken, expiresAt };
          } catch (e) {
            console.warn("Failed to parse token expiry, using default", e);
            // Fallback to 55 minutes if parsing fails
            tokenCache[userId] = {
              token: freshToken,
              expiresAt: Date.now() + 55 * 60 * 1000,
            };
          }

          return freshToken;
        } else {
          console.error("Failed to get fresh token");
          return null;
        }
      } catch (error) {
        console.error("Error getting fresh token:", error);
        return null;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    const token = await refreshPromise;
    if (!token) {
      throw new AuthError(401, "Failed to obtain authentication token");
    }

    return token;
  };

  return async <T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    // Wait for auth to be ready
    if (!auth.isLoaded) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Get a valid token using our optimized function
    const token = await getValidToken();

    // Log the token prefix for debugging
    console.log(
      `Making request to ${endpoint} with token prefix: ${token.substring(
        0,
        10
      )}...`
    );

    return makeBackendRequest<T>(endpoint, {
      ...options,
      sessionToken: token,
    });
  };
}
