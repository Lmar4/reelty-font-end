import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TRPCProvider } from "@/providers/TRPCProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reelty - Real Estate Video Generator",
  description: "Generate professional real estate videos in minutes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <TRPCProvider>
            {children}
            <Toaster />
          </TRPCProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
