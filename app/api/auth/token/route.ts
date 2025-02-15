import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  const token = await session.getToken();

  return new NextResponse(token || "", {
    status: token ? 200 : 401,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
