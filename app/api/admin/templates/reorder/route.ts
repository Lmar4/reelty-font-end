import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { Template } from "@/types/prisma-types";

export const PUT = withAuthServer(async function PUT(
  request: AuthenticatedRequest
) {
  try {
    const body = await request.json();
    const templates = await makeBackendRequest<Template[]>(
      "/api/admin/templates/reorder",
      {
        method: "PUT",
        sessionToken: request.auth.sessionToken,
        body,
      }
    );

    return NextResponse.json(templates);
  } catch (error) {
    console.error("[TEMPLATES_REORDER_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to reorder templates",
      { status: 500 }
    );
  }
});
