import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session.userId;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Make a request to our backend to get the presigned URL
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/storage/presigned-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_SECRET_KEY}`,
        },
        body: JSON.stringify({
          filename,
          contentType,
          userId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get presigned URL");
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("[PRESIGNED_URL_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    );
  }
}
