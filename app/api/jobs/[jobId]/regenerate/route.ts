import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { jobId } = await params;
    const body = await request.json();
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/jobs/${jobId}/regenerate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userId}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to regenerate job");
    }

    const job = await response.json();
    return NextResponse.json(job);
  } catch (error) {
    console.error("[JOB_REGENERATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
