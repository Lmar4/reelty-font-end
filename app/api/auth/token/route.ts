import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session || !session.userId) {
    return new NextResponse("", { status: 401 });
  }

  const token = await session.getToken();
  return new NextResponse(token);
}
