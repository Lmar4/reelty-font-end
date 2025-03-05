"use client";

import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthState {
  isReady: boolean;
  token: string | null;
  userId: string | null;
  tokenExpiresAt: number | null;
}

const AuthContext = createContext<AuthState>({
  isReady: false,
  token: null,
  userId: null,
  tokenExpiresAt: null,
});

function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const { getToken, userId, isLoaded } = useClerkAuth();
  const [state, setState] = useState<AuthState>({
    isReady: false,
    token: null,
    userId: null,
    tokenExpiresAt: null,
  });

  // Function to refresh token
  const refreshToken = async () => {
    if (isLoaded && userId) {
      try {
        const token = await getToken();
        if (token) {
          // Set token expiry to 55 minutes (Clerk tokens typically last 60 minutes)
          // This gives us a 5-minute buffer before actual expiration
          const tokenExpiresAt = Date.now() + 55 * 60 * 1000;

          setState({
            isReady: true,
            token,
            userId,
            tokenExpiresAt,
          });

          return { token, expiresAt: tokenExpiresAt };
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
      }
    }
    return null;
  };

  // Initial token fetch
  useEffect(() => {
    refreshToken();
  }, [isLoaded, userId]);

  // Set up token refresh interval
  useEffect(() => {
    if (!isLoaded || !userId) return;

    // Check token every minute
    const intervalId = setInterval(async () => {
      // If token expires in less than 5 minutes, refresh it
      if (
        state.tokenExpiresAt &&
        Date.now() > state.tokenExpiresAt - 5 * 60 * 1000
      ) {
        await refreshToken();
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(intervalId);
  }, [isLoaded, userId, state.tokenExpiresAt]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <AuthStateProvider>{children}</AuthStateProvider>
    </ClerkProvider>
  );
}

// Custom hook to access auth state
export function useAuth() {
  const clerkAuth = useClerkAuth();
  const authState = useContext(AuthContext);

  return {
    ...clerkAuth,
    isReady: authState.isReady,
    cachedToken: authState.token,
    tokenExpiresAt: authState.tokenExpiresAt,
  };
}
