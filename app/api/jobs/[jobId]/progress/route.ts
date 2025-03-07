import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

// Handler function
async function getJobProgress(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const data = await makeBackendRequest(`/api/jobs/${jobId}/progress`, {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[JOB_PROGRESS_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch job progress",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const authHandler = await withAuthServer(getJobProgress);
  return authHandler(req, context);
}

// Helper function to determine stage from job status
function getStageFromStatus(
  status: string
): "runway" | "template" | "upload" | "vision" {
  switch (status) {
    case "PENDING":
      return "runway";
    case "PROCESSING":
      return "template";
    case "COMPLETED":
      return "upload";
    case "FAILED":
      return "vision";
    default:
      return "runway";
  }
}

// Helper function to get a user-friendly message based on job status
function getMessageFromStatus(status: string): string {
  switch (status) {
    case "PENDING":
      return "Preparing to process your video";
    case "PROCESSING":
      return "Creating your video";
    case "COMPLETED":
      return "Video processing complete";
    case "FAILED":
      return "There was an issue processing your video";
    default:
      return "Processing your video";
  }
}
