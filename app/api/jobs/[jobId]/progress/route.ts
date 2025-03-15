import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest, ApiError } from "@/utils/types";

// Handler function
async function getJobProgress(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    
    // Log request attempt
    console.log(`[JOB_PROGRESS] Attempting to fetch progress for job ${jobId}`, {
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
      endpoint: `/jobs/${jobId}/progress`
    });
    
    const data = await makeBackendRequest(`/jobs/${jobId}/progress`, {
      method: "GET",
      sessionToken: req.auth.sessionToken,
      headers: {
        // Ensure Origin header is set properly
        'Origin': 'https://reelty.io'
      }
    });
    
    console.log(`[JOB_PROGRESS] Successfully fetched progress for job ${jobId}`);
    return NextResponse.json(data);
  } catch (error) {
    // Type guard for AuthError or ApiError which have statusCode
    const isApiError = error && typeof error === 'object' && 'statusCode' in error;
    const statusCode = isApiError ? (error as { statusCode: number }).statusCode : 500;
    
    // Enhanced error logging with more context
    const jobId = params ? (await params).jobId : undefined;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    console.error("[JOB_PROGRESS_ERROR]", error, {
      backendUrl,
      jobId,
      statusCode,
      endpoint: jobId ? `/jobs/${jobId}/progress` : undefined,
      fullUrl: jobId ? `${backendUrl}/jobs/${jobId}/progress` : undefined,
    });
    
    // For 404 errors, return a more graceful fallback response
    if (statusCode === 404) {
      console.log(`[JOB_PROGRESS] Job ${jobId} not found, returning fallback response`);
      return NextResponse.json({
        stage: "runway",
        progress: 0,
        message: "Initializing job...",
        error: "Job not found or still initializing"
      }, { status: 200 }); // Return 200 with fallback data instead of 404
    }
    
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch job progress",
      { status: statusCode }
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
