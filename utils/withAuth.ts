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
  sessionToken: string;
  headers?: Record<string, string>;
}

// Main request function
export async function makeBackendRequest<T>(
  endpoint: string,
  options: RequestOptions
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
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = (await response.json()) as ApiResponse<any>;
        throw new Error(
          errorData.error ||
            errorData.message ||
            `Request failed with status ${response.status}`
        );
      } else {
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

    // Parse JSON safely and handle ApiResponse wrapper
    try {
      const parsedResponse = JSON.parse(text) as ApiResponse<T>;

      // If the response follows our API pattern
      if ("success" in parsedResponse) {
        if (!parsedResponse.success) {
          throw new Error(parsedResponse.error || "Request failed");
        }
        // Return just the data part if it exists, otherwise return the whole response
        return (
          parsedResponse.data !== undefined
            ? parsedResponse.data
            : parsedResponse
        ) as T;
      }

      // Fallback for endpoints that might not yet follow the pattern
      return parsedResponse as T;
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
