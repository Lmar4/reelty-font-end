import { useAuth } from "@clerk/nextjs";

// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface RequestOptions {
  method?: string;
  body?: any;
  sessionToken?: string;
  headers?: Record<string, string>;
}

// Error types to match backend
export class AuthError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

export class ApiError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

// Main request function that works both client and server-side
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
    let token = sessionToken;

    // Final token check
    if (!token) {
      throw new AuthError(401, "No valid session token available");
    }

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
      mode: "cors",
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

    const token = await auth.getToken();
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

      const [token, currentUserId] = await Promise.all([
        auth.getToken(),
        auth.userId,
      ]);
      return !!(token && currentUserId);
    } catch {
      return false;
    }
  };

  return checkAuth;
}
