import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";

import { AuthenticatedRequest } from "@/utils/types";

// Handler functions
async function getJob(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const data = await makeBackendRequest(`/api/jobs/${jobId}`, {
      method: "GET",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[JOB_GET_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch job",
      { status: 500 }
    );
  }
}

async function deleteJob(
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
    console.error("[JOB_DELETE_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to delete job",
      { status: 500 }
    );
  }
}

async function updateJob(
  req: AuthenticatedRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = await req.json();

    const data = await makeBackendRequest(`/api/jobs/${jobId}`, {
      method: "PATCH",
      sessionToken: req.auth.sessionToken,
      body,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[JOB_UPDATE_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to update job",
      { status: 500 }
    );
  }
}

// Next.js App Router handlers
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const authHandler = await withAuthServer(getJob);
  return authHandler(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const authHandler = await withAuthServer(deleteJob);
  return authHandler(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const authHandler = await withAuthServer(updateJob);
  return authHandler(req, context);
}
