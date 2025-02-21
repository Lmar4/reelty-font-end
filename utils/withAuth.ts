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

interface RequestOptions {
  method?: string;
  body?: any;
  sessionToken: string;
  headers?: Record<string, string>;
}

// Main request function
export async function makeBackendRequest<T>(
  endpoint: string,
  options: RequestOptions
): Promise<T> {
  const { method = "GET", body, sessionToken, headers = {} } = options;

  try {
    console.debug("[REQUEST]", {
      endpoint,
      method,
      hasToken: !!sessionToken,
      tokenPreview: sessionToken ? `${sessionToken.slice(0, 10)}...` : null,
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
        ...headers,
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("[REQUEST_ERROR]", {
      endpoint,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    if (error instanceof Error) {
      if (error.message.includes("401") || error.message.includes("403")) {
        throw new Error("Session expired or invalid");
      }
    }

    throw error;
  }
}

// Route handler wrapper
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
