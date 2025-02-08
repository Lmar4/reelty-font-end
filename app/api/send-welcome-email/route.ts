import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { render } from "@react-email/render";
import WelcomeEmail from "@/emails/WelcomeEmail";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
    console.error("Error sending welcome email:", error);
    return NextResponse.json(
      { error: "Error sending welcome email" },
      { status: 500 }
    );
  }
}
