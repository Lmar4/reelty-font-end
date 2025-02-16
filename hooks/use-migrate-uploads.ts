import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface MigrationResult {
  oldKey: string;
  newKey?: string;
  error?: string;
  success: boolean;
}

export const useMigrateUploads = () => {
  const { isSignedIn } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);

  const migrateUploads = async (
    sessionId: string,
    files: Array<{ s3Key: string }>
  ): Promise<MigrationResult[]> => {
    if (!isSignedIn) {
      throw new Error("User must be signed in to migrate files");
    }

    try {
      setIsMigrating(true);

      const response = await fetch("/api/storage/migrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          files,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to migrate files");
      }

      return data.results;
    } catch (error) {
      console.error("[MIGRATE_ERROR]", error);
      throw error;
    } finally {
      setIsMigrating(false);
    }
  };

  return {
    migrateUploads,
    isMigrating,
  };
};
