import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent, UserJSON } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Webhook secret key from Clerk Dashboard
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

async function handler(request: Request) {
  if (!webhookSecret) {
    console.error(
      "Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
    return new NextResponse("Error: Missing webhook secret", {
      status: 500,
    });
  }

  const payload = await request.json();
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Error: Missing svix headers", {
      status: 400,
    });
  }

  // Create a new Svix instance with your secret
  const wh = new Webhook(webhookSecret);
  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse("Error: Webhook verification failed", {
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

      // Return 200 to acknowledge receipt of the webhook
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error("Error syncing user with backend:", error);
      // Return 500 to indicate processing failed and webhook should be retried
      return new NextResponse("Error: Failed to sync user", { status: 500 });
    }
  }

  // Return 200 for unhandled event types
  return NextResponse.json({ success: true }, { status: 200 });
}

export const POST = handler;
