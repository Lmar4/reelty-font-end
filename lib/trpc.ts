import { createTRPCNext } from '@trpc/next';
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../reelty_backend/src/trpc/router";
import { QueryClient } from "@tanstack/react-query";
import { getAuth } from "firebase/auth";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL; // use backend URL if available
  return `http://localhost:${process.env.PORT ?? 4000}`; // dev SSR should use localhost
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
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
      queryClient,
    };
  },
  ssr: false,
});
