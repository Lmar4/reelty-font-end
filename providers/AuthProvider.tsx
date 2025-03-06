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
  lastRefreshAttempt: number | null; // Track last refresh attempt
  refreshError: string | null; // Track refresh errors
}

const AuthContext = createContext<AuthState>({
  isReady: false,
  token: null,
  userId: null,
  tokenExpiresAt: null,
  lastRefreshAttempt: null,
  refreshError: null,
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
  });

  // Function to refresh token with improved error handling and logging
  const refreshToken = useCallback(async () => {
    if (!isLoaded || !userId) {
      console.log("Not refreshing token: User not loaded or not signed in");
      return null;
    }

    // Record refresh attempt time
    const attemptTime = Date.now();
    setState((prev) => ({ ...prev, lastRefreshAttempt: attemptTime }));

    try {
      console.log("Attempting to refresh token...");
      const token = await getToken();

      if (!token) {
        console.error("Token refresh failed: Empty token returned");
        setState((prev) => ({
          ...prev,
          refreshError: "Empty token returned",
        }));
        return null;
      }

      // Set token expiry to 55 minutes (Clerk tokens typically last 60 minutes)
      const tokenExpiresAt = Date.now() + 55 * 60 * 1000;

      setState({
        isReady: true,
        token,
        userId,
        tokenExpiresAt,
        lastRefreshAttempt: attemptTime,
        refreshError: null,
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

      setState((prev) => ({
        ...prev,
        refreshError: errorMessage,
      }));

      return null;
    }
  }, [isLoaded, userId, getToken]);

  // Initial token fetch with improved logging
  useEffect(() => {
    console.log("Auth state changed:", { isLoaded, isSignedIn: !!userId });

    if (isLoaded && userId) {
      console.log("User authenticated, fetching initial token");
      refreshToken();
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
      });
    }
  }, [isLoaded, userId, refreshToken]);

  // Enhanced token refresh logic with backoff for failures
  useEffect(() => {
    if (!isLoaded || !userId) return;

    // Function to determine if token needs refresh
    const needsRefresh = () => {
      if (!state.token || !state.tokenExpiresAt) return true;

      // Refresh if token expires in less than 5 minutes
      const expiresInMs = state.tokenExpiresAt - Date.now();
      const expiresInMinutes = Math.round(expiresInMs / 60000);

      if (expiresInMs < 5 * 60 * 1000) {
        console.log(
          `Token expires in ${expiresInMinutes} minutes, needs refresh`
        );
        return true;
      }

      return false;
    };

    // Check token every minute
    const intervalId = setInterval(async () => {
      if (needsRefresh()) {
        await refreshToken();
      }
    }, 60 * 1000); // Check every minute

    // Also refresh immediately if needed
    if (needsRefresh()) {
      refreshToken();
    }

    return () => clearInterval(intervalId);
  }, [isLoaded, userId, state.token, state.tokenExpiresAt, refreshToken]);

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

// Enhanced custom hook to access auth state with token validation
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

  return {
    ...clerkAuth,
    isReady: authState.isReady,
    cachedToken: authState.token,
    tokenExpiresAt: authState.tokenExpiresAt,
    isTokenValid,
    lastRefreshAttempt: authState.lastRefreshAttempt,
    refreshError: authState.refreshError,
  };
}
