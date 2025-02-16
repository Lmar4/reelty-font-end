import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

export const runtime = "nodejs";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
} as const;

export async function POST(req: Request) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const { sessionId, files } = await req.json();

    if (!sessionId || !files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400, headers: corsHeaders }
      );
    }

    const results = await Promise.all(
      files.map(async (file) => {
        const sourceKey = file.s3Key;
        const newKey = sourceKey.replace(
          `temp/${sessionId}/`,
          `${session.userId}/`
        );

        try {
          // Copy the file to the new location
          await s3.send(
            new CopyObjectCommand({
              Bucket: process.env.AWS_BUCKET!,
              CopySource: `${process.env.AWS_BUCKET}/${sourceKey}`,
              Key: newKey,
              MetadataDirective: "REPLACE",
              Metadata: {
                userId: session.userId,
              },
            })
          );

          // Delete the temporary file
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET!,
              Key: sourceKey,
            })
          );

          return {
            oldKey: sourceKey,
            newKey,
            success: true,
          };
        } catch (error) {
          console.error("[MIGRATE_ERROR]", {
            sourceKey,
            newKey,
            error: error instanceof Error ? error.message : "Unknown error",
          });

          return {
            oldKey: sourceKey,
            error: error instanceof Error ? error.message : "Migration failed",
            success: false,
          };
        }
      })
    );

    const failedMigrations = results.filter((r) => !r.success);
    if (failedMigrations.length > 0) {
      return NextResponse.json(
        {
          error: "Some files failed to migrate",
          results,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, results },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[MIGRATE_ERROR]", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
