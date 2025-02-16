export interface BackendResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error(
      "Backend URL not configured. Please set NEXT_PUBLIC_BACKEND_URL in your environment variables."
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
    hasAuthHeader: headers.has("Authorization"),
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
        headers: Object.fromEntries(response.headers.entries()),
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

// Re-export types and functions from withAuthServer
export { withAuth, type AuthenticatedRequest } from "./withAuthServer";
