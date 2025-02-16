import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  return NextResponse.json({
    userId: session?.userId,
    isAuthenticated: !!session?.userId,
    sessionId: session?.sessionId,
    hasSession: !!session,
    hasToken: !!(session && 'getToken' in session)
  });
}
