import { AuthenticatedRequest } from "@/utils/types";
import { withAuthServer } from "@/utils/withAuthServer";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const agencySchema = z.object({
  name: z.string().min(1),
  maxUsers: z.number().int().positive(),
  ownerId: z.string().min(1),
});

// Handler functions
async function getAgencies(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });

    const response = await fetch(
      `${process.env.BACKEND_URL}/admin/agencies?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${request.auth.sessionToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch agencies");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[AGENCIES_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch agencies" },
      { status: 500 }
    );
  }
}

async function createAgency(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = agencySchema.parse(body);

    const response = await fetch(`${process.env.BACKEND_URL}/admin/agencies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${request.auth.sessionToken}`,
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error("Failed to create agency");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[AGENCIES_POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create agency" },
      { status: 500 }
    );
  }
}

// Next.js App Router handlers
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getAgencies);
  return authHandler(req);
}

export async function POST(req: NextRequest) {
  const authHandler = await withAuthServer(createAgency);
  return authHandler(req);
}
