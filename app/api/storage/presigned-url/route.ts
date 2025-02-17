import { auth } from "@clerk/nextjs/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

export const runtime = "nodejs";

// Validate environment variables
if (
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.AWS_BUCKET
) {
  console.error(
    "[PRESIGNED_URL_ERROR] Missing required environment variables",
    {
      AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
      AWS_BUCKET: !!process.env.AWS_BUCKET,
    }
  );
  throw new Error("Missing required environment variables");
}

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
} as const;

// Helper to generate a unique session ID for temporary uploads
const generateSessionId = () => crypto.randomBytes(16).toString("hex");

export async function POST(request: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const { filename, contentType, isTemporary, sessionId } = body;

    // Validate required fields
    if (!filename || !contentType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Get current user if authenticated
    const session = await auth();
    const userId = session?.userId;

    // For non-temporary uploads, require authentication
    if (!isTemporary && !userId) {
      return new Response(
        JSON.stringify({
          error: "Authentication required",
          authRequired: true,
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // For temporary uploads, we need either a sessionId or create a new one
    const uploadSessionId = isTemporary
      ? sessionId || generateSessionId()
      : userId;

    // Generate a unique key for the file
    const fileExtension = filename.split(".").pop();
    const randomString = crypto.randomBytes(8).toString("hex");
    const key = userId
      ? `users/${userId}/listings/${randomString}.${fileExtension}` // Authenticated users: store in their listings directory
      : `temp/${uploadSessionId}/${randomString}.${fileExtension}`; // Guest users: store in temp directory

    // Create the presigned URL
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET, // We validated this earlier
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

    return new Response(
      JSON.stringify({
        url,
        key,
        sessionId: isTemporary ? uploadSessionId : undefined,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          ...(session
            ? { Authorization: `Bearer ${await session.getToken()}` }
            : {}),
        },
      }
    );
  } catch (error) {
    console.error("[PRESIGNED_URL_ERROR]", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal Server Error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
