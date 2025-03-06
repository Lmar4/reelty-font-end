"use client";

import { useUserData } from "./useUserData";
import { UserRole } from "@/types/prisma-types";

/**
 * Hook to check if the current user has the required role
 * @param requiredRole The role required for access
 * @returns boolean indicating if the user has the required role
 */
export function useRoleAccess(requiredRole: UserRole): boolean {
  const { data: userData, isLoading } = useUserData();

  if (isLoading || !userData) {
    return false;
  }

  return userData.role === requiredRole;
}
