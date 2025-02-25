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
  "Access-Control-Allow-Origin":
    process.env.NEXT_PUBLIC_APP_URL || "https://www.reelty.io",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": [
    "Authorization",
    "Content-Type",
    "x-amz-acl",
    "x-amz-content-sha256",
    "x-amz-date",
    "x-amz-security-token",
    "x-amz-checksum-algorithm",
    "x-amz-meta-originalfilename",
    "x-amz-meta-temporary",
    "x-amz-meta-sessionid",
    "x-amz-meta-expiresat",
    "x-amz-meta-userid",
    "*",
  ].join(", "),
  "Access-Control-Expose-Headers": [
    "ETag",
    "x-amz-server-side-encryption",
    "x-amz-request-id",
    "x-amz-id-2",
    "x-amz-checksum-algorithm",
  ].join(", "),
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

    // Create the presigned URL with properly formatted metadata
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      ContentType: contentType,
      ACL: "private",
      Metadata: {
        ...(isTemporary && {
          temporary: "true",
          sessionid: uploadSessionId,
          expiresat: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        }),
        ...(userId && { userid: userId }),
        originalfilename: filename, // S3 metadata keys must be lowercase
      },
    });

    // Add debug logging
    console.log("[PRESIGNED_URL] Generating URL:", {
      isTemporary,
      hasUserId: !!userId,
      key,
      contentType,
      origin: request.headers.get("origin"),
    });

    // Configure signed headers
    const signedHeadersOptions = {
      expiresIn: 3600,
      signableHeaders: new Set([
        "host",
        "content-type",
        "x-amz-acl",
        "x-amz-content-sha256",
        "x-amz-date",
        "x-amz-security-token",
        "x-amz-checksum-algorithm",
        "x-amz-meta-originalfilename",
        "x-amz-meta-temporary",
        "x-amz-meta-sessionid",
        "x-amz-meta-expiresat",
        "x-amz-meta-userid",
      ]),
    };

    const url = await getSignedUrl(s3, command, signedHeadersOptions);

    console.log("[PRESIGNED_URL] Generated successfully:", {
      key,
      hasUrl: !!url,
      sessionId: isTemporary ? uploadSessionId : undefined,
    });

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
    console.error("[PRESIGNED_URL_ERROR] Detailed error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      headers: Object.fromEntries(request.headers.entries()),
      origin: request.headers.get("origin"),
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
