import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthenticatedRequest extends Request {
  auth: {
    sessionToken: string;
    userId: string;
    role?: string;
  };
}

// Route handler wrapper
type ApiHandler = (
  request: AuthenticatedRequest,
  ...args: any[]
) => Promise<NextResponse>;

// Error class to match backend
export class AuthError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

// Helper function to create consistent responses
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string,
  statusCode: number = 200
): NextResponse {
  return new NextResponse(
    JSON.stringify({
      success,
      ...(data !== undefined && { data }),
      ...(message && { message }),
      ...(error && { error }),
    }),
    {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// Validate request helper
async function validateRequest(request: Request) {
  try {
    const session = await auth();
    const user = await currentUser();

    if (!session?.userId || !user) {
      throw new AuthError(401, "Invalid or missing session");
    }

    const token = await session.getToken();
    if (!token) {
      throw new AuthError(401, "No session token available");
    }

    // Verify the token is valid by checking the Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // If no Authorization header, use the session token
      return {
        token,
        userId: user.id,
        user,
      };
    }

    // If Authorization header exists, verify it matches our session token
    const providedToken = authHeader.split("Bearer ")[1];
    if (providedToken !== token) {
      console.warn("Token mismatch between session and request");
      // Still use the session token as it's more reliable
    }

    return {
      token,
      userId: user.id,
      user,
    };
  } catch (error) {
    console.error("Auth validation error:", error);
    throw new AuthError(401, "Invalid or missing session");
  }
}

export function withAuthServer(handler: ApiHandler) {
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
export function withAdminAuth(handler: ApiHandler) {
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
