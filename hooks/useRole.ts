"use client";

import { useUserData } from "./useUserData";
import { UserRole } from "@/types/prisma-types";

export function useRole(): UserRole {
  const { data: userData } = useUserData();
  return userData?.role || UserRole.USER;
}
