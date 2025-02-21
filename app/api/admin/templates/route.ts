import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { Template } from "@/types/prisma-types";

export const GET = withAuthServer(async function GET(
  req: AuthenticatedRequest
) {
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
});

export const POST = withAuthServer(async function POST(
  request: AuthenticatedRequest
) {
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
});
