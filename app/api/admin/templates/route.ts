import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { Template } from "@/types/prisma-types";
import { AuthenticatedRequest } from "@/utils/types";

// Handler functions
async function getTemplates(req: AuthenticatedRequest) {
  try {
    const templates = await makeBackendRequest<Template[]>(
      "/api/admin/templates",
      {
        method: "GET",
        sessionToken: req.auth.sessionToken,
      }
    );

    return NextResponse.json(templates);
  } catch (error) {
    console.error("[TEMPLATES_GET_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch templates",
      { status: 500 }
    );
  }
}

async function createTemplate(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const template = await makeBackendRequest<Template>(
      "/api/admin/templates",
      {
        method: "POST",
        sessionToken: request.auth.sessionToken,
        body,
      }
    );

    return NextResponse.json(template);
  } catch (error) {
    console.error("[TEMPLATES_POST_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to create template",
      { status: 500 }
    );
  }
}

// Next.js App Router handlers
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getTemplates);
  return authHandler(req);
}

export async function POST(req: NextRequest) {
  const authHandler = await withAuthServer(createTemplate);
  return authHandler(req);
}
