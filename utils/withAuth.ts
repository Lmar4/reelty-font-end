import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export interface AuthenticatedRequest extends Request {
  auth: {
    sessionToken: string;
    userId: string;
  };
}

export interface BackendResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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

export async function makeBackendRequest<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    sessionToken?: string;
    headers?: HeadersInit;
  }
): Promise<T> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    throw new Error(
      "Backend URL not configured. Please set BACKEND_URL in your environment variables."
    );
  }

  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (options.sessionToken) {
    headers.set("Authorization", `Bearer ${options.sessionToken}`);
  }

  // For FormData, don't set any Content-Type and let the browser handle it
  // For other cases, ensure we have application/json
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const requestOptions: RequestInit = {
    method: options.method || "GET",
    headers,
    // Don't transform FormData, but stringify other bodies
    body: isFormData
      ? options.body
      : options.body
      ? JSON.stringify(options.body)
      : undefined,
  };

  console.log("[BACKEND_REQUEST] Making request:", {
    endpoint,
    method: requestOptions.method,
    hasFormData: isFormData,
    contentType: headers.get("Content-Type") || "browser-handled",
    hasBody: !!requestOptions.body,
  });

  try {
    const response = await fetch(`${backendUrl}${endpoint}`, requestOptions);
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[BACKEND_REQUEST] Request failed:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
        contentType,
      });
      throw new Error(`Backend error: ${errorText || response.statusText}`);
    }

    // Only try to parse JSON if the response is JSON
    if (contentType?.includes("application/json")) {
      const backendResponse = (await response.json()) as BackendResponse<T>;
      if (!backendResponse.success) {
        throw new Error(backendResponse.error || "Unknown error occurred");
      }
      return backendResponse.data as T;
    } else {
      // For non-JSON responses, return the raw response
      return response as unknown as T;
    }
  } catch (error) {
    console.error("[BACKEND_REQUEST_ERROR]", {
      endpoint,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}
