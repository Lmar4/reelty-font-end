import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "../contexts/AuthContext";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { ToastProvider } from "@/components/common/Toast";
import { TRPCProvider } from "@/providers/TRPCProvider";
import { CSPostHogProvider } from "@/providers/Posthog";
import { withTRPC } from "@trpc/next";
import { httpBatchLink } from "@trpc/client";
import { AppRouter } from "../../reelty_backend/src/trpc/router";
import superjson from "superjson";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 4000}`; // dev SSR should use localhost
};

export const metadata: Metadata = {
  title: "Reelty App",
  description: "Real Estate Application",
};

export default withTRPC<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      transformer: superjson,
    };
  },
  ssr: false,
})(function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={`${inter.variable} antialiased`}>
        <ErrorBoundary>
          <CSPostHogProvider>
            <AuthProvider>
              <TRPCProvider>
                <ToastProvider>{children}</ToastProvider>
              </TRPCProvider>
            </AuthProvider>
          </CSPostHogProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
});
