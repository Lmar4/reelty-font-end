import WelcomeEmail from "@/emails/WelcomeEmail";
import { AuthenticatedRequest, withAuth } from "@/utils/withAuth";
import { currentUser } from "@clerk/nextjs/server";
import { render } from "@react-email/render";
import { NextResponse } from "next/server";

export const POST = withAuth(async function POST(
  request: AuthenticatedRequest
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const emailHtml = render(
      WelcomeEmail({
        firstName: user.firstName || "there",
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://app.reelty.com",
      })
    );

    // Send welcome email via PLUNK
    await fetch("https://api.useplunk.com/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PLUNK_PUBLIC_API_KEY}`,
      },
      body: JSON.stringify({
        html: emailHtml,
        subject: "Welcome to Reelty!",
        to: user.emailAddresses[0].emailAddress,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WELCOME_EMAIL_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to send welcome email",
      { status: 500 }
    );
  }
});
