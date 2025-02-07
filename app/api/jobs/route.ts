import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");
    const status = searchParams.get("status");

    const response = await fetch(`${process.env.BACKEND_URL}/api/jobs`, {
      headers: {
        Authorization: `Bearer ${userId}`,
        ...(listingId && { "X-Listing-Id": listingId }),
        ...(status && { "X-Status": status }),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch jobs");
    }

    const jobs = await response.json();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("[JOBS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const response = await fetch(`${process.env.BACKEND_URL}/api/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userId}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create job");
    }

    const job = await response.json();
    return NextResponse.json(job);
  } catch (error) {
    console.error("[JOBS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
