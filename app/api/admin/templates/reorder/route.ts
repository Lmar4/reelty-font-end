import { Template } from "@/types/prisma-types";
import { AuthenticatedRequest } from "@/utils/types";
import { makeBackendRequest } from "@/utils/withAuth";
import { withAuthServer } from "@/utils/withAuthServer";
import { NextRequest, NextResponse } from "next/server";

// Handler function
async function reorderTemplates(request: AuthenticatedRequest) {
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
}

// Next.js App Router handler
export async function PUT(req: NextRequest) {
  const authHandler = await withAuthServer(reorderTemplates);
  return authHandler(req);
}
