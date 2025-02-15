"use client";

import { GoogleMapsProvider } from "./GoogleMapsProvider";
import { ToastProvider } from "@/components/common/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleMapsProvider>
      <ToastProvider>{children}</ToastProvider>
    </GoogleMapsProvider>
  );
}
