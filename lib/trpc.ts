import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../reelty_backend/src/trpc/router";
import { QueryClient } from "@tanstack/react-query";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Check if we're in development
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:4000';
    }
    // In production, use the deployed backend URL
    return process.env.NEXT_PUBLIC_API_URL || '';
  }
  // SSR should use the backend URL
  return process.env.BACKEND_URL || 'http://localhost:4000';
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 1000, // Consider data stale after 5 seconds
    },
  },
});

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      headers: async () => {
        const token = await fetch('/api/auth/token').then(res => res.text());
        return {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        };
      },
    }),
  ],
});
