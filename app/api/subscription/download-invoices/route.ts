import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";

export const GET = withAuthServer(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Users can only download their own invoices
    if (request.auth.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const response = await makeBackendRequest<{ url: string }>(
      `/api/subscription/download-invoices/${userId}`,
      {
        sessionToken: request.auth.sessionToken,
      }
    );

    // Return a temporary URL to download the ZIP file
    return NextResponse.json(response);
  } catch (error) {
    console.error("[SUBSCRIPTION_DOWNLOAD_INVOICES_GET]", error);
    return NextResponse.json(
      { error: "Failed to generate invoice download" },
      { status: 500 }
    );
  }
});
