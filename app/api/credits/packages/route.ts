import { NextResponse } from "next/server";
import {
  withAuth,
  AuthenticatedRequest,
  makeBackendRequest,
} from "@/utils/withAuth";

interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  stripePriceId: string;
}

export const GET = withAuth(async function GET(request: AuthenticatedRequest) {
  try {
    const packages = await makeBackendRequest<CreditPackage[]>(
      "/api/credits/packages",
      {
        method: "GET",
        sessionToken: request.auth.sessionToken,
      }
    );

    return NextResponse.json(packages);
  } catch (error) {
    console.error("[CREDIT_PACKAGES_ERROR]", error);
    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to fetch credit packages",
      { status: 500 }
    );
  }
});
