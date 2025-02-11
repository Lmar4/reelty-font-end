import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/providers/query-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers/Providers";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

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
      <body className={`${geist.variable} min-h-screen flex flex-col`}>
        <ClerkProvider afterSignOutUrl='/'>
          <QueryProvider>
            <AuthProvider>
              <Providers>
                <main className='flex-grow flex flex-col'>{children}</main>
                <Toaster />
              </Providers>
            </AuthProvider>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
