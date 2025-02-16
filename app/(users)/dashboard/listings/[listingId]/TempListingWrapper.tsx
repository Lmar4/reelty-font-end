"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useListingSession } from "@/hooks/use-listing-session";
import NewListingModal from "@/components/reelty/NewListingModal";

export default function TempListingWrapper({
  listingId,
}: {
  listingId: string;
}) {
  const router = useRouter();
  const { sessionData, isLoading } = useListingSession();

  useEffect(() => {
    // Only redirect if we're not loading and have no session
    if (!isLoading && !sessionData) {
      console.log('No session data found, redirecting to dashboard');
      router.replace("/dashboard");
      return;
    }
  }, [sessionData, isLoading, router]);

  // Show loading state while checking session
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Only show null after we've confirmed no session
  if (!sessionData) {
    return null;
  }

  return (
    <div>
      <NewListingModal
        isOpen={true}
        onClose={() => {
          router.push("/dashboard");
        }}
        initialAddress={sessionData.address}
        initialCoordinates={sessionData.coordinates}
        tempListingId={listingId}
      />
    </div>
  );
}
