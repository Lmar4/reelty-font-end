"use client";

import { GoogleMapsProvider } from "./GoogleMapsProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <GoogleMapsProvider>{children}</GoogleMapsProvider>;
}
