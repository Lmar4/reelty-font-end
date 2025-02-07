import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/providers/query-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reelty - Real Estate Video Generator",
  description: "Transform your listing photos into viral Reels in seconds!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ClerkProvider>
          <QueryProvider>
            <AuthProvider>
              <Providers>
                {children}
                <Toaster />
              </Providers>
            </AuthProvider>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
