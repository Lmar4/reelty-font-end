"use client";

import { useUserData } from "./useUserData";
import type { UserRole } from "@/types/prisma-types";

export function useRole(): UserRole {
  const { data: userData } = useUserData();
  return userData?.role || "USER";
}
