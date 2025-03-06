import { ApiResponse } from "@/types/api-types";
import { UseQueryResult } from "@tanstack/react-query";

/**
 * Unwraps a potentially double-nested API response
 * @param response The API response to unwrap
 * @returns The unwrapped data
 */
export function unwrapApiResponse<T>(response: any): T {
  // Handle double-nested structure
  if (response?.success && response?.data?.success && response?.data?.data) {
    return response.data.data;
  }

  // Handle standard structure
  if (response?.success && response?.data) {
    return response.data;
  }

  // Return the response as is if it doesn't match expected patterns
  return response as T;
}

/**
 * Transforms a query result to unwrap nested API responses
 * @param result The query result to transform
 * @returns The transformed query result with unwrapped data
 */
export function unwrapQueryResult<T>(
  result: UseQueryResult<ApiResponse<T>>
): Omit<UseQueryResult<ApiResponse<T>>, "data"> & {
  data: T | undefined;
  originalData?: ApiResponse<T>;
} {
  return {
    ...result,
    data: result.data ? unwrapApiResponse<T>(result.data) : undefined,
    originalData: result.data, // Keep the original data in case it's needed
  };
}
