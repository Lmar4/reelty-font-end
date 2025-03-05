"use server";

import { auth } from "@clerk/nextjs/server";
import { makeServerBackendRequest } from "./withAuthServer";
import { ApiResponse } from "./types";

/**
 * Server action to fetch data from the backend API
 * This can be used directly in server components or imported in client components
 */
export async function fetchFromBackend<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<ApiResponse<T>> {
  try {
    const data = await makeServerBackendRequest<ApiResponse<T>>(
      endpoint,
      options
    );
    return data;
  } catch (error) {
    console.error("Server action fetch failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Check if the current user is authenticated
 * This can be used in server components to verify authentication
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await auth();
    return !!session?.userId;
  } catch {
    return false;
  }
}

/**
 * Get the current user's ID
 * This can be used in server components to get the user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.userId || null;
  } catch {
    return null;
  }
}

/**
 * Get the current user's session token
 * This can be used in server components to get the session token
 */
export async function getSessionToken(): Promise<string | null> {
  try {
    const session = await auth();
    if (!session?.userId) return null;

    const token = await session.getToken();
    return token;
  } catch {
    return null;
  }
}
