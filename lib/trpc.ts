import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../reelty_backend/src/trpc/router";
import superjson from "superjson";
import { QueryClient } from "@tanstack/react-query";
import { getAuth } from "firebase/auth";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL; // use backend URL if available
  return `http://localhost:${process.env.PORT ?? 4000}`; // dev SSR should use localhost
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
