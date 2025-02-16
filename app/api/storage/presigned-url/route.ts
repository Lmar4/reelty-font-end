import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

export const runtime = "nodejs"; // Changed from edge to nodejs for local development

// Log environment variables (excluding secrets)
console.log("[S3_CONFIG] Environment:", {
  region: process.env.AWS_REGION,
  bucket: process.env.AWS_BUCKET,
  hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
});

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// CORS headers for development and production
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
} as const;

// Helper function to return error responses
const errorResponse = (message: string, status: number = 400) => {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
};

// Helper to generate a unique session ID for temporary uploads
const generateSessionId = () => crypto.randomBytes(16).toString("hex");

export async function POST(req: Request) {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Parse request body first
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return errorResponse("Invalid request body");
    }

    const { filename, contentType, isTemporary, sessionId } = body;

    // Validate required fields
    if (!filename || !contentType) {
      return errorResponse("Missing required fields");
    }

    // Get current user if authenticated
    const session = await auth();
    const userId = session?.userId;

    // For non-temporary uploads, require authentication
    if (!isTemporary && !userId) {
      return errorResponse("Authentication required for permanent uploads", 401);
    }

    // For temporary uploads, we need either a sessionId or create a new one
    const uploadSessionId = isTemporary
      ? sessionId || generateSessionId()
      : userId;

    // Generate a unique key for the file
    const fileExtension = filename.split(".").pop();
    const randomString = crypto.randomBytes(8).toString("hex");
    const key = isTemporary
      ? `temp/${uploadSessionId}/${randomString}.${fileExtension}`
      : `${uploadSessionId}/${randomString}.${fileExtension}`;

    // Create the presigned URL
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET!,
      Key: key,
      ContentType: contentType,
      Metadata: {
        ...(isTemporary && {
          temporary: "true",
          sessionId: uploadSessionId,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        }),
        ...(userId && { userId }),
      },
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json(
      {
        url,
        key,
        sessionId: isTemporary ? uploadSessionId : undefined,
      },
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[PRESIGNED_URL_ERROR]", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return errorResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      500
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
