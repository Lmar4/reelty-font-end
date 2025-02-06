import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../reelty_backend/src/trpc/router";
import superjson from "superjson";
import { QueryClient } from "@tanstack/react-query";
import { getAuth } from "firebase/auth";

const getBaseUrl = () => {
  // Use the environment variable for the API base URL
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
};

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      async headers() {
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();

        return {
          ...(token && { Authorization: `Bearer ${token}` }),
        };
      },
    }),
  ],
  transformer: superjson,
});
