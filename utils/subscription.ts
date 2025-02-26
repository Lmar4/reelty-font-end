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
    const response = (await makeBackendRequest(
      "/api/subscription/ensure-tier",
      {
        method: "POST",
        body: { userId },
        sessionToken,
      }
    )) as Response;

    if (!response.ok) {
      // Return default free tier values if request fails
      return {
        maxActiveListings: 1,
        name: "Free Trial",
        currentCount: 0,
      };
    }

    const data = await response.json();
    return data.tier;
  } catch (error) {
    // Return default free tier values if request fails
    return {
      maxActiveListings: 1,
      name: "Free Trial",
      currentCount: 0,
    };
  }
}
