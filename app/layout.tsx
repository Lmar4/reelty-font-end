import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "../contexts/AuthContext";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { ToastProvider } from "@/components/common/Toast";
import { TRPCProvider } from "@/providers/TRPCProvider";
import { CSPostHogProvider } from "@/providers/Posthog";
import { trpc } from "../lib/trpc";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Reelty App",
  description: "Real Estate Application",
};

export default trpc.withTRPC(function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
