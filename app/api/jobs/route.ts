import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";
import { VideoJob } from "@/types/prisma-types";

async function handleGet(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");
    const status = searchParams.get("status");

    let endpoint = "/api/jobs";
    if (listingId) endpoint += `?listingId=${listingId}`;
    if (status) endpoint += `${listingId ? "&" : "?"}status=${status}`;

    const jobs = await makeBackendRequest<VideoJob[]>(endpoint, {
      method: "GET",
      sessionToken: request.auth.sessionToken,
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("[JOBS_GET]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch jobs",
      { status: 500 }
    );
  }
}

async function handlePost(request: AuthenticatedRequest) {
  try {
    const body = await request.json();

    const job = await makeBackendRequest<VideoJob>("/api/jobs", {
      method: "POST",
      sessionToken: request.auth.sessionToken,
      body: {
        ...body,
        userId: request.auth.userId,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("[JOBS_POST]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to create job",
      { status: 500 }
    );
  }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost);
