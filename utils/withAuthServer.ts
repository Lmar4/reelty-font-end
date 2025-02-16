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

      if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      const sessionToken = await session.getToken();
      if (!sessionToken) {
        return new NextResponse("No session token available", { status: 401 });
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
        `Authentication error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        { status: 401 }
      );
    }
  };
}
