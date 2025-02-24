import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent, UserJSON } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Webhook secret key from Clerk Dashboard
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

async function handler(request: Request) {
  const payload = await request.json();
  const headersList = await headers();
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Create a new Svix instance with your secret
  const wh = new Webhook(webhookSecret || "");
  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  if (eventType === "user.created" || eventType === "user.updated") {
    const {
      id: userId,
      email_addresses,
      first_name,
      last_name,
    } = evt.data as UserJSON;
    const email = email_addresses?.[0]?.email_address;

    try {
      // Sync user data with our backend
      const response = await fetch(`${process.env.BACKEND_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({
          id: userId,
          email,
          firstName: first_name,
          lastName: last_name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync user with backend");
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error syncing user with backend:", error);
      return new NextResponse("Error syncing user", { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export const POST = handler;
