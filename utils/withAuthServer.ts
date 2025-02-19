import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export interface AuthenticatedRequest extends Request {
  auth: {
    sessionToken: string;
    userId: string;
  };
}

type ApiHandler = (
  request: AuthenticatedRequest,
  ...args: any[]
) => Promise<NextResponse>;

export function withAuth(handler: ApiHandler) {
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

      let sessionToken: string;
      try {
        const token = await session.getToken();
        if (!token) {
          return new NextResponse(
            JSON.stringify({ error: "No session token available" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          );
        }
        sessionToken = token;
      } catch (error) {
        console.error("[SESSION_TOKEN_ERROR]", error);
        return new NextResponse(
          JSON.stringify({ error: "Invalid or missing session" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      // Extend the request object with auth information
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.auth = {
        sessionToken,
        userId: user.id,
      };

      // Call the original handler with the authenticated request
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
