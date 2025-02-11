import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { makeBackendRequest } from "@/utils/withAuth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await auth();
    const { userId } = session;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const token = await session.getToken();
    if (!token) {
      return new NextResponse("No valid session token", { status: 401 });
    }

    const { jobId } = await params;
    const body = await request.json();

    const job = await makeBackendRequest(`/api/jobs/${jobId}/regenerate`, {
      method: "POST",
      sessionToken: token,
      body,
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("[JOB_REGENERATE]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error",
      { status: 500 }
    );
  }
}
