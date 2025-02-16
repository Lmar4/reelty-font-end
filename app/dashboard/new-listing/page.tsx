"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useListingSession } from "@/hooks/use-listing-session";
import { useMigrateUploads } from "@/hooks/use-migrate-uploads";
import NewListingModal from "@/components/reelty/NewListingModal";
import { toast } from "sonner";

export default function NewListingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { sessionData, clearSession } = useListingSession();
  const { migrateUploads } = useMigrateUploads();
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    // Only proceed if auth is loaded and user is signed in
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-up");
      return;
    }

    // Check if we have a session to migrate
    if (sessionData && sessionData.photos.length > 0 && !isMigrating) {
      setIsMigrating(true);

      // Get the sessionId from the first photo's s3Key
      const match = sessionData.photos[0].s3Key.match(/temp\/([^/]+)/);
      if (!match) {
        console.error("Could not extract sessionId from s3Key");
        return;
      }

      const sessionId = match[1];

      // Migrate the temporary files
      migrateUploads(sessionId, sessionData.photos.map(p => ({ s3Key: p.s3Key })))
        .then(() => {
          toast.success("Successfully migrated photos");
          // Clear the session after successful migration
          clearSession();
        })
        .catch((error) => {
          console.error("Error migrating files:", error);
          toast.error("Failed to migrate photos");
        })
        .finally(() => {
          setIsMigrating(false);
        });
    }
  }, [isLoaded, isSignedIn, router, sessionData, migrateUploads, clearSession, isMigrating]);

  const handleClose = () => {
    setIsModalOpen(false);
    router.push("/dashboard");
  };

  return (
    <NewListingModal
      isOpen={isModalOpen}
      onClose={handleClose}
      initialFiles={[]}
      initialAddress={sessionData?.address}
      initialCoordinates={sessionData?.coordinates}
    />
  );
}
