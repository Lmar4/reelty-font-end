import { useAuth } from "../providers/AuthProvider";
import { makeBackendRequest } from "./withAuth";
import { AuthError, RequestOptions } from "./types";

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

    if (auth.isTokenValid && auth.isTokenValid() && auth.cachedToken) {
      token = auth.cachedToken;
      console.log("Using cached valid token");
    } else {
      // Otherwise get a fresh token
      console.log("Cached token invalid or missing, getting fresh token");
      try {
        const freshToken = await auth.getToken();
        if (freshToken) {
          token = freshToken;
          console.log("Fresh token obtained");
        } else {
          console.error("Failed to get fresh token");
        }
      } catch (error) {
        console.error("Error getting fresh token:", error);
        throw new AuthError(401, "Failed to obtain authentication token");
      }
    }

    if (!token) {
      console.error("No valid token available after refresh attempt");
      throw new AuthError(401, "No valid session token available");
    }

    // Log the token prefix for debugging
    console.log(
      `Making request to ${endpoint} with token prefix: ${token.substring(
        0,
        10
      )}...`
    );

    return makeBackendRequest<T>(endpoint, {
      ...options,
      sessionToken: token,
    });
  };
}
