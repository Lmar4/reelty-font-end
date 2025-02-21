import { useAuth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

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

    const json = (await response.json()) as BackendResponse<T>;

    if (!response.ok || !json.success) {
      throw new Error(json.error || `HTTP error! status: ${response.status}`);
    }

    return json.data as T; // Unwrap data here
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
