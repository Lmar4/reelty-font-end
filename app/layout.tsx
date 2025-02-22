import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers/Providers";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { cn } from "@/lib/utils";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reelty | Turn listing photos into viral Reels",
  description: "Transform your listing photos into viral Reels in seconds!",
  metadataBase: new URL("https://reelty.app"),
  authors: [{ name: "Reelty" }],
  creator: "Reelty",
  publisher: "Reelty",
  keywords: [
    "real estate",
    "reels",
    "video creation",
    "listing photos",
    "social media",
    "automation",
  ],
  openGraph: {
    type: "website",
    title: "Reelty | Turn listing photos into viral Reels",
    description: "Transform your listing photos into viral Reels in seconds!",
    url: "https://reelty.io",
    siteName: "Reelty",
    images: [
      {
        url: "/images/og.png",
        width: 1200,
        height: 630,
        alt: "Reelty - Transform listing photos into viral Reels",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reelty | Turn listing photos into viral Reels",
    description: "Transform your listing photos into viral Reels in seconds!",
    images: ["/images/og.png"],
    creator: "@reelty",
    site: "@reelty",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    // Regular favicons
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/light/favicon.ico",
        href: "/light/favicon.ico",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/dark/favicon.ico",
        href: "/dark/favicon.ico",
      },
      // 16x16 favicons
      {
        media: "(prefers-color-scheme: light)",
        url: "/light/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/dark/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      // 32x32 favicons
      {
        media: "(prefers-color-scheme: light)",
        url: "/light/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/dark/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    // Apple Touch Icon
    apple: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/light/apple-touch-icon.png",
        sizes: "180x180",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/dark/apple-touch-icon.png",
        sizes: "180x180",
      },
    ],
    // Android Chrome Icons
    other: [
      {
        rel: "android-chrome-192x192",
        media: "(prefers-color-scheme: light)",
        url: "/light/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-192x192",
        media: "(prefers-color-scheme: dark)",
        url: "/dark/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        media: "(prefers-color-scheme: light)",
        url: "/light/android-chrome-512x512.png",
      },
      {
        rel: "android-chrome-512x512",
        media: "(prefers-color-scheme: dark)",
        url: "/dark/android-chrome-512x512.png",
      },
    ],
  },
  // Web Manifest
  manifest: "/light/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body
        className={cn(
          geist.variable,
          "min-h-screen bg-background antialiased overflow-x-hidden"
        )}
      >
        <ErrorBoundary>
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
        </ErrorBoundary>
      </body>
    </html>
  );
}
