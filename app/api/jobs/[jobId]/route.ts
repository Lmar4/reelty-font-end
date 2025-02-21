import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { VideoJob } from "@/types/prisma-types";

export const GET = withAuthServer(async function GET(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const job = await makeBackendRequest<VideoJob>(`/api/jobs/${jobId}`, {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("[JOB_GET]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch job",
      { status: 500 }
    );
  }
});

export const DELETE = withAuthServer(async function DELETE(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    await makeBackendRequest(`/api/jobs/${jobId}`, {
      method: "DELETE",
      sessionToken: req.auth.sessionToken,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[JOB_DELETE]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to delete job",
      { status: 500 }
    );
  }
});

export const PATCH = withAuthServer(async function PATCH(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = await request.json();

    const job = await makeBackendRequest<VideoJob>(`/api/jobs/${jobId}`, {
      method: "PATCH",
      sessionToken: request.auth.sessionToken,
      body: body,
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("[JOB_PATCH]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to update job",
      { status: 500 }
    );
  }
});
