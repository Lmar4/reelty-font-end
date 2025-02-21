import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";

export const GET = withAuthServer(async function POST(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = await request.json();

    const job = await makeBackendRequest(`/api/jobs/${jobId}/regenerate`, {
      method: "POST",
      sessionToken: request.auth.sessionToken,
      body: body,
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("[JOB_REGENERATE]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to regenerate job",
      { status: 500 }
    );
  }
});
