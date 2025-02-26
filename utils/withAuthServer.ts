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
  };
}

// Route handler wrapper
type ApiHandler = (
  request: AuthenticatedRequest,
  ...args: any[]
) => Promise<NextResponse>;

// Helper function to create consistent responses
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string
): NextResponse {
  return new NextResponse(
    JSON.stringify({
      success,
      ...(data !== undefined && { data }),
      ...(message && { message }),
      ...(error && { error }),
    }),
    {
      status: success ? 200 : error ? 400 : 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export function withAuthServer(handler: ApiHandler) {
  return async (request: Request, ...args: any[]) => {
    try {
      const session = await auth();
      const user = await currentUser();

      if (!session) {
        return createApiResponse(
          false,
          undefined,
          undefined,
          "No active session"
        );
      }

      if (!user) {
        return createApiResponse(false, undefined, undefined, "User not found");
      }

      const token = await session.getToken();
      if (!token) {
        return createApiResponse(
          false,
          undefined,
          undefined,
          "No session token available"
        );
      }

      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.auth = {
        sessionToken: token,
        userId: user.id,
      };

      return handler(authenticatedRequest, ...args);
    } catch (error) {
      console.error("[AUTH_ERROR]", error);
      return createApiResponse(
        false,
        undefined,
        undefined,
        `Authentication error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };
}
