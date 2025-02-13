"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewListingRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Check for pending listing data
    const pendingListing = sessionStorage.getItem("pendingListing");
    if (!pendingListing) {
      // If no pending listing, redirect to dashboard
      router.push("/dashboard");
      return;
    }

    // Redirect to dashboard which will handle the modal
    router.push("/dashboard");
  }, [router]);

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='animate-pulse text-gray-500'>Loading your listing...</div>
    </div>
  );
}
