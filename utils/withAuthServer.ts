import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

// Types
export interface BackendResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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

export function withAuthServer(handler: ApiHandler) {
  return async (request: Request, ...args: any[]) => {
    try {
      const session = await auth();
      const user = await currentUser();

      if (!session) {
        return new NextResponse(
          JSON.stringify({ error: "No active session" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      if (!user) {
        return new NextResponse(JSON.stringify({ error: "User not found" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const token = await session.getToken();
      if (!token) {
        return new NextResponse(
          JSON.stringify({ error: "No session token available" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
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
      return new NextResponse(
        JSON.stringify({
          error: `Authentication error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  };
}
