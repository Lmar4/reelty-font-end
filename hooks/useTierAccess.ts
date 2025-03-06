"use client";

import { useUserData } from "./useUserData";

// Define valid tier IDs
type TierId =
  | "550e8400-e29b-41d4-a716-446655440000" // FREE
  | "550e8400-e29b-41d4-a716-446655440001" // REELTY
  | "550e8400-e29b-41d4-a716-446655440002" // REELTY_PRO
  | "550e8400-e29b-41d4-a716-446655440003"; // REELTY_PRO_PLUS

/**
 * Hook to check if the current user has access to features of the required tier
 * @param requiredTier The tier ID required for access
 * @returns boolean indicating if the user has access to the required tier
 */
export function useTierAccess(requiredTier: TierId): boolean {
  const { data: userData, isLoading } = useUserData();

  if (isLoading || !userData?.data?.currentTierId) {
    return false;
  }

  // Define the tier hierarchy
  const tierOrder: Record<TierId, number> = {
    "550e8400-e29b-41d4-a716-446655440000": 0, // FREE
    "550e8400-e29b-41d4-a716-446655440001": 1, // REELTY
    "550e8400-e29b-41d4-a716-446655440002": 2, // REELTY_PRO
    "550e8400-e29b-41d4-a716-446655440003": 3, // REELTY_PRO_PLUS
  };

  // Check if the user's tier is equal to or higher than the required tier
  const userTierId = userData.data.currentTierId as TierId;
  return tierOrder[userTierId] >= tierOrder[requiredTier];
}
