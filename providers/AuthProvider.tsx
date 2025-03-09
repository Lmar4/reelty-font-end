"use client";

import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/nextjs";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

interface AuthState {
  isReady: boolean;
  token: string | null;
  userId: string | null;
  tokenExpiresAt: number | null;
  lastRefreshAttempt: number | null;
  refreshError: string | null;
  isRefreshing: boolean;
  backoffUntil: number | null;
}

const AuthContext = createContext<AuthState>({
  isReady: false,
  token: null,
  userId: null,
  tokenExpiresAt: null,
  lastRefreshAttempt: null,
  refreshError: null,
  isRefreshing: false,
  backoffUntil: null,
});

function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const { getToken, userId, isLoaded, isSignedIn } = useClerkAuth();
  const [state, setState] = useState<AuthState>({
    isReady: false,
    token: null,
    userId: null,
    tokenExpiresAt: null,
    lastRefreshAttempt: null,
    refreshError: null,
    isRefreshing: false,
    backoffUntil: null,
  });

  // Enhanced token refresh function with rate limiting protection
  const refreshToken = useCallback(
    async (force = false) => {
      if (!isLoaded || !userId) {
        console.log("Not refreshing token: User not loaded or not signed in");
        return null;
      }

      // Check if we're in backoff period
      const now = Date.now();
      if (state.backoffUntil && now < state.backoffUntil && !force) {
        console.log(
          `Token refresh in backoff period until ${new Date(
            state.backoffUntil
          ).toISOString()}, skipping`
        );
        return null;
      }

      // Don't refresh if already refreshing unless forced
      if (state.isRefreshing && !force) {
        console.log("Token refresh already in progress, skipping");
        return null;
      }

      // Record refresh attempt time and set refreshing state
      const attemptTime = now;
      setState((prev) => ({
        ...prev,
        lastRefreshAttempt: attemptTime,
        isRefreshing: true,
      }));

      try {
        console.log("Attempting to refresh token...");

        // Get token with retry logic
        let retryCount = 0;
        const maxRetries = 3;
        let token = null;
        let error = null;

        while (retryCount < maxRetries && !token) {
          try {
            // Add delay for retries with exponential backoff
            if (retryCount > 0) {
              const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
              console.log(
                `Retry ${retryCount}/${maxRetries} after ${delay}ms delay`
              );
              await new Promise((resolve) => setTimeout(resolve, delay));
            }

            token = await getToken();
            break;
          } catch (e) {
            error = e;
            retryCount++;
            console.warn(`Token refresh attempt ${retryCount} failed:`, e);

            // Check if it's a rate limit error (429)
            const isRateLimit =
              e instanceof Error &&
              (e.message.includes("429") ||
                e.message.includes("Too Many Requests"));

            if (isRateLimit) {
              // For rate limit errors, use longer backoff
              break;
            }
          }
        }

        if (!token) {
          console.error("Token refresh failed after retries:", error);

          // Set backoff period based on error type
          const backoffDuration =
            error instanceof Error &&
            (error.message.includes("429") ||
              error.message.includes("Too Many Requests"))
              ? 60 * 1000 // 1 minute for rate limiting
              : 30 * 1000; // 30 seconds for other errors

          const backoffUntil = Date.now() + backoffDuration;

          setState((prev) => ({
            ...prev,
            refreshError:
              error instanceof Error
                ? error.message
                : "Failed to refresh token",
            isRefreshing: false,
            backoffUntil,
          }));

          console.log(
            `Setting backoff until ${new Date(backoffUntil).toISOString()}`
          );
          return null;
        }

        // Parse the JWT to get actual expiration time
        // JWT exp is in seconds since epoch, convert to milliseconds
        let tokenExpiresAt: number;
        try {
          const base64Url = token.split(".")[1];
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
          // Set expiry to actual token expiry minus 5 minutes for safety margin
          tokenExpiresAt = payload.exp * 1000 - 5 * 60 * 1000;
        } catch (e) {
          console.warn("Failed to parse token expiry, using default", e);
          // Fallback to 55 minutes if parsing fails
          tokenExpiresAt = Date.now() + 55 * 60 * 1000;
        }

        setState({
          isReady: true,
          token,
          userId,
          tokenExpiresAt,
          lastRefreshAttempt: attemptTime,
          refreshError: null,
          isRefreshing: false,
          backoffUntil: null, // Clear backoff on success
        });

        // Log token details for debugging (first 10 chars only for security)
        console.log(
          `Token refreshed successfully. Expires in ${Math.round(
            (tokenExpiresAt - Date.now()) / 60000
          )} minutes`
        );
        console.log(`Token prefix: ${token.substring(0, 10)}...`);

        return { token, expiresAt: tokenExpiresAt };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Failed to refresh token:", errorMessage);

        // Set backoff period
        const backoffUntil = Date.now() + 30 * 1000; // 30 seconds backoff

        setState((prev) => ({
          ...prev,
          refreshError: errorMessage,
          isRefreshing: false,
          backoffUntil,
        }));

        console.log(
          `Setting backoff until ${new Date(backoffUntil).toISOString()}`
        );
        return null;
      }
    },
    [isLoaded, userId, getToken, state.isRefreshing, state.backoffUntil]
  );

  // Function to determine if token needs refresh
  const needsRefresh = useCallback(() => {
    if (!state.token || !state.tokenExpiresAt) return true;

    // Don't refresh if in backoff period
    if (state.backoffUntil && Date.now() < state.backoffUntil) {
      return false;
    }

    // Refresh if token expires in less than 10 minutes (more proactive)
    const expiresInMs = state.tokenExpiresAt - Date.now();
    const expiresInMinutes = Math.round(expiresInMs / 60000);

    if (expiresInMs < 10 * 60 * 1000) {
      console.log(
        `Token expires in ${expiresInMinutes} minutes, needs refresh`
      );
      return true;
    }

    return false;
  }, [state.token, state.tokenExpiresAt, state.backoffUntil]);

  // Initial token fetch with improved logging
  useEffect(() => {
    console.log("Auth state changed:", { isLoaded, isSignedIn: !!userId });

    if (isLoaded && userId) {
      console.log("User authenticated, fetching initial token");
      refreshToken(true); // Force refresh on initial load
    } else if (isLoaded && !userId) {
      console.log("User not authenticated, clearing token state");
      // Clear state if user is not logged in
      setState({
        isReady: true,
        token: null,
        userId: null,
        tokenExpiresAt: null,
        lastRefreshAttempt: null,
        refreshError: null,
        isRefreshing: false,
        backoffUntil: null,
      });
    }
  }, [isLoaded, userId, refreshToken]);

  // Enhanced token refresh logic with adaptive interval
  useEffect(() => {
    if (!isLoaded || !userId) return;

    // Use a longer interval if we've had refresh errors
    const checkInterval = state.refreshError ? 60 * 1000 : 30 * 1000; // 60s if errors, 30s normally

    // Check token periodically
    const intervalId = setInterval(async () => {
      if (needsRefresh()) {
        await refreshToken();
      }
    }, checkInterval);

    // Also refresh immediately if needed
    if (needsRefresh()) {
      refreshToken();
    }

    return () => clearInterval(intervalId);
  }, [isLoaded, userId, refreshToken, needsRefresh, state.refreshError]);

  // Add debug logging for token state changes
  useEffect(() => {
    if (state.token) {
      console.log("Token state updated:", {
        hasToken: true,
        expiresIn: state.tokenExpiresAt
          ? `${Math.round((state.tokenExpiresAt - Date.now()) / 60000)} minutes`
          : "unknown",
      });
    }
  }, [state.token, state.tokenExpiresAt]);

  // Set up global event listener for token requests
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleTokenRequest = (event: CustomEvent) => {
      if (
        event.detail &&
        event.detail.callback &&
        typeof event.detail.callback === "function"
      ) {
        if (state.token) {
          event.detail.callback(state.token);
        } else {
          // If no token available, try to get one
          getToken()
            .then((token) => {
              if (token) {
                event.detail.callback(token);
              }
            })
            .catch((err) => {
              console.error("Error getting token for event request:", err);
            });
        }
      }
    };

    // Add event listener
    window.addEventListener(
      "auth:getToken",
      handleTokenRequest as EventListener
    );

    // Clean up
    return () => {
      window.removeEventListener(
        "auth:getToken",
        handleTokenRequest as EventListener
      );
    };
  }, [state.token, getToken]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Add validation for the publishable key
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    console.error(
      "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable"
    );
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <AuthStateProvider>{children}</AuthStateProvider>
    </ClerkProvider>
  );
}

// Enhanced custom hook to access auth state with token validation and refresh capability
export function useAuth() {
  const clerkAuth = useClerkAuth();
  const authState = useContext(AuthContext);

  // Add a helper function to check if the token is valid
  const isTokenValid = useCallback(() => {
    return !!(
      authState.token &&
      authState.tokenExpiresAt &&
      Date.now() < authState.tokenExpiresAt
    );
  }, [authState.token, authState.tokenExpiresAt]);

  // Add a function to force token refresh
  const refreshToken = useCallback(async () => {
    // This is a hack to access the refreshToken function from the provider
    // In a real implementation, you would expose this function properly
    const refreshFn = (document.querySelector("[data-refresh-token]") as any)
      ?.refreshToken;
    if (refreshFn) {
      return refreshFn(true);
    }
    // Fallback to getting a new token
    return clerkAuth.getToken({ skipCache: true });
  }, [clerkAuth]);

  return {
    ...clerkAuth,
    isReady: authState.isReady,
    cachedToken: authState.token,
    tokenExpiresAt: authState.tokenExpiresAt,
    isTokenValid,
    lastRefreshAttempt: authState.lastRefreshAttempt,
    refreshError: authState.refreshError,
    isRefreshing: authState.isRefreshing,
    refreshToken, // Expose the refresh function
  };
}
