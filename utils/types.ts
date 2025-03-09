// Common types used across client and server
import { NextResponse } from "next/server";

// API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Request options for API calls
export interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  sessionToken?: string;
  critical?: boolean; // Add this property
}

// Error types
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

// Helper function to create consistent responses
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string,
  statusCode: number = 200
): NextResponse {
  return new NextResponse(
    JSON.stringify({
      success,
      ...(data !== undefined && { data }),
      ...(message && { message }),
      ...(error && { error }),
    }),
    {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// Server-specific types
export interface AuthenticatedRequest extends Request {
  auth: {
    sessionToken: string;
    userId: string;
    role?: string;
  };
}

export type ApiHandler = (
  request: AuthenticatedRequest,
  ...args: any[]
) => Promise<NextResponse>;
