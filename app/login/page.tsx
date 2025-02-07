"use client";

import { Suspense } from "react";
import { LoginForm } from "./_components/login-form";
import { PendingListingHandler } from "./_components/pending-listing-handler";

// Loading fallback component
function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <PendingListingHandler>
        <LoginForm />
      </PendingListingHandler>
    </Suspense>
  );
}
