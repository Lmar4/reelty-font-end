"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import {
  ApiResponse,
  AuthError,
  createApiResponse,
  AuthenticatedRequest,
  ApiHandler,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

// Enhanced validate request helper with token refresh capability
async function validateRequest(request: Request) {
  try {
    const session = await auth();
    const user = await currentUser();

    // Enhanced logging
    console.log("[Server Auth] Validating request", {
      hasSession: !!session,
      hasUserId: !!session?.userId,
      hasUser: !!user,
      path: request.url,
    });

    if (!session?.userId || !user) {
      console.error("[Server Auth] Invalid session", {
        sessionExists: !!session,
        userId: session?.userId,
        userExists: !!user,
      });
      throw new AuthError(401, "Invalid or missing session");
    }

    // Get a fresh token with each request to ensure it's valid
    // This is more reliable than caching tokens on the server
    const token = await session.getToken();
    if (!token) {
      console.error("[Server Auth] No token available");
      throw new AuthError(401, "No session token available");
    }

    // Log token prefix for debugging
    console.log("[Server Auth] Token obtained", {
      tokenPrefix: token.substring(0, 10) + "...",
      userId: user.id,
    });

    // Verify the token is valid by checking the Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // If no Authorization header, use the session token
      console.log("[Server Auth] No Authorization header, using session token");
      return {
        token,
        userId: user.id,
        user,
      };
    }

    // If Authorization header exists, verify it matches our session token
    const providedToken = authHeader.split("Bearer ")[1];
    if (providedToken !== token) {
      console.warn("[Server Auth] Token mismatch between session and request", {
        sessionTokenPrefix: token.substring(0, 10) + "...",
        providedTokenPrefix: providedToken.substring(0, 10) + "...",
      });
      // Still use the session token as it's more reliable
    }

    return {
      token,
      userId: user.id,
      user,
    };
  } catch (error) {
    console.error("[Server Auth] Validation error:", error);
    throw new AuthError(401, "Invalid or missing session");
  }
}

export async function withAuthServer(handler: ApiHandler) {
  return async (request: Request, ...args: any[]) => {
    try {
      const { token, userId, user } = await validateRequest(request);

      // Create authenticated request object
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.auth = {
        sessionToken: token,
        userId: userId,
      };

      // Add role if available from user metadata
      const userRole = user.publicMetadata?.role as string | undefined;
      if (userRole) {
        authenticatedRequest.auth.role = userRole;
      }

      return handler(authenticatedRequest, ...args);
    } catch (error) {
      console.error("[AUTH_ERROR]", error);

      if (error instanceof AuthError) {
        return createApiResponse(
          false,
          undefined,
          undefined,
          error.message,
          error.statusCode
        );
      }

      return createApiResponse(
        false,
        undefined,
        undefined,
        "Authentication failed",
        401
      );
    }
  };
}

// Admin middleware
export async function withAdminAuth(handler: ApiHandler) {
  return withAuthServer(async (request: AuthenticatedRequest, ...args) => {
    if (request.auth.role !== "ADMIN") {
      return createApiResponse(
        false,
        undefined,
        undefined,
        "Unauthorized: Admin access required",
        403
      );
    }

    return handler(request, ...args);
  });
}

// Enhanced server-side function to make authenticated requests to the backend
export async function makeServerBackendRequest<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  try {
    // Get session token from Clerk - always get a fresh token
    const session = await auth();
    if (!session?.userId) {
      throw new AuthError(401, "No valid session");
    }

    const token = await session.getToken();
    if (!token) {
      throw new AuthError(401, "No session token available");
    }

    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle response
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const errorData = (await response.json()) as ApiResponse<any>;
        throw new AuthError(
          response.status,
          errorData.error || errorData.message || "Request failed"
        );
      }
      throw new AuthError(
        response.status,
        (await response.text()) || "Request failed"
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error("Server API request failed:", error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError(
      500,
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
}
