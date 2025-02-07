import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { jobId } = await params;
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/jobs/${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${userId}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch job");
    }

    const job = await response.json();
    return NextResponse.json(job);
  } catch (error) {
    console.error("[JOB_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
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
      `${process.env.BACKEND_URL}/api/jobs/${jobId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${userId}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update job");
    }

    const job = await response.json();
    return NextResponse.json(job);
  } catch (error) {
    console.error("[JOB_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { jobId } = await params;
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/jobs/${jobId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userId}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete job");
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[JOB_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
