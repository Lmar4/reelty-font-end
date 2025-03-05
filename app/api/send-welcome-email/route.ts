import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

// Handler function
async function sendWelcomeEmail(req: AuthenticatedRequest) {
  try {
    const data = await makeBackendRequest("/api/send-welcome-email", {
      method: "POST",
      sessionToken: req.auth.sessionToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[WELCOME_EMAIL_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to send welcome email",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function POST(req: NextRequest) {
  const authHandler = await withAuthServer(sendWelcomeEmail);
  return authHandler(req);
}
