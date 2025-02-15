"use client";

import { ClerkProvider } from "@clerk/nextjs";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}

// Export useAuth hook replacement
export { useAuth } from "@clerk/nextjs";
