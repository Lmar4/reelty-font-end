import { makeBackendRequest } from "./withAuth";

interface DefaultTier {
  maxActiveListings: number;
  name: string;
  currentCount: number;
}

export async function ensureUserDefaultTier(
  userId: string,
  sessionToken: string
): Promise<DefaultTier> {
  try {
    const response = await makeBackendRequest<DefaultTier>(
      "/api/subscription/ensure-tier",
      {
        method: "POST",
        body: { userId },
        sessionToken,
      }
    );

    return response;
  } catch (error) {
    // Return default free tier values if request fails
    console.error("Failed to ensure user tier:", error);
    return {
      maxActiveListings: 1,
      name: "Free Trial",
      currentCount: 0,
    };
  }
}
