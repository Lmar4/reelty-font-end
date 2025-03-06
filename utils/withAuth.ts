import { useAuth } from "../providers/AuthProvider";
import { ApiResponse, RequestOptions, AuthError, ApiError } from "./types";

// Main request function for client-side
export async function makeBackendRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, sessionToken, headers = {} } = options;

  // Ensure we have a valid backend URL
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new ApiError(500, "Backend URL is not configured");
  }

  const url = `${backendUrl}${endpoint}`;

  try {
    // Final token check
    if (!sessionToken) {
      throw new AuthError(401, "No valid session token available");
    }

    console.log(
      `Making ${method} request to ${endpoint} with token prefix: ${sessionToken.substring(
        0,
        10
      )}...`
    );

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
      mode: "cors",
    });

    // Handle response
    if (!response.ok) {
      // Handle 401 errors specifically
      if (response.status === 401) {
        console.error(
          "Authentication failed - token may be expired or invalid"
        );

        // Only redirect if we're in the browser
        if (typeof window !== "undefined") {
          window.location.href =
            "/login?redirect=" + encodeURIComponent(window.location.pathname);
        }
        throw new AuthError(
          401,
          "Authentication failed - redirecting to login"
        );
      }

      // Handle other errors
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

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    try {
      const parsedResponse = JSON.parse(text);
      return parsedResponse as T;
    } catch (e) {
      console.error("Failed to parse JSON response:", text);
      throw new ApiError(500, "Invalid JSON response from server");
    }
  } catch (error) {
    if (error instanceof AuthError || error instanceof ApiError) {
      throw error;
    }
    console.error("API request failed:", error);
    throw new ApiError(
      500,
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
}

// Custom hook for making authenticated requests in components
export function useAuthenticatedRequest() {
  const auth = useAuth();

  return async <T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    // Wait for auth to be ready
    if (!auth.isLoaded) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Ensure we have authentication
    if (!auth.userId) {
      throw new AuthError(401, "User not authenticated");
    }

    // Try to use cached token if available and not expired
    let token: string | undefined;

    if (
      auth.cachedToken &&
      auth.tokenExpiresAt &&
      Date.now() < auth.tokenExpiresAt
    ) {
      token = auth.cachedToken;
    } else {
      // Otherwise get a fresh token
      const freshToken = await auth.getToken();
      if (freshToken) {
        token = freshToken;
      }
    }

    if (!token) {
      throw new AuthError(401, "No valid session token available");
    }

    return makeBackendRequest<T>(endpoint, {
      ...options,
      sessionToken: token,
    });
  };
}

// Hook for checking authentication status
export function useIsAuthenticated() {
  const auth = useAuth();

  const checkAuth = async (): Promise<boolean> => {
    try {
      // Wait for auth to be ready
      if (!auth.isLoaded) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const token = auth.cachedToken || (await auth.getToken());
      return !!(token && auth.userId);
    } catch {
      return false;
    }
  };

  return checkAuth;
}
