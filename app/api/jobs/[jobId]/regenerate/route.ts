import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

// Handler function
async function regenerateJob(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const data = await makeBackendRequest(`/api/jobs/${jobId}/regenerate`, {
      method: "POST",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[JOB_REGENERATE_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to regenerate job",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const authHandler = await withAuthServer(regenerateJob);
  return authHandler(req, context);
}
