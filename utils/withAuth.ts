import { useAuth } from "@clerk/nextjs";

// Types
export interface BackendResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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
  options: {
    method?: string;
    body?: any;
    sessionToken: string;
    headers?: Record<string, string>;
  }
): Promise<T> {
  const { method = "GET", body, sessionToken, headers = {} } = options;

  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
        ...headers,
      },
      body:
        typeof body === "string"
          ? body
          : body
          ? JSON.stringify(body)
          : undefined,
    });

    // First check if the response is ok
    if (!response.ok) {
      // Try to parse error as JSON, but handle case where it's not JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            errorData.message ||
            `Request failed with status ${response.status}`
        );
      } else {
        // Handle non-JSON error responses
        const errorText = await response.text();
        throw new Error(
          errorText || `Request failed with status ${response.status}`
        );
      }
    }

    // Check if response is empty
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    // Parse JSON safely
    try {
      return JSON.parse(text) as T;
    } catch (e) {
      console.error("Failed to parse JSON response:", text);
      throw new Error("Invalid JSON response from server");
    }
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

// Client-side auth hook
export const useAuthToken = () => {
  const { getToken, userId } = useAuth();

  const getAuthToken = async () => {
    try {
      const token = await getToken();
      return {
        token,
        userId,
      };
    } catch (error) {
      console.error("[GET_AUTH_TOKEN_ERROR]", error);
      throw error;
    }
  };

  return getAuthToken;
};
