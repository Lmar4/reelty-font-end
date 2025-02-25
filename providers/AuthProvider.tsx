"use client";

import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthState {
  isReady: boolean;
  token: string | null;
  userId: string | null;
}

const AuthContext = createContext<AuthState>({
  isReady: false,
  token: null,
  userId: null,
});

function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const { getToken, userId, isLoaded } = useClerkAuth();
  const [state, setState] = useState<AuthState>({
    isReady: false,
    token: null,
    userId: null,
  });

  useEffect(() => {
    if (isLoaded && userId) {
      getToken().then((token) => {
        setState({
          isReady: true,
          token,
          userId,
        });
      });
    }
  }, [isLoaded, userId, getToken]);

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
  };
}
