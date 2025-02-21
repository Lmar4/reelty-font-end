import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";

interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  stripePriceId: string;
}

export const GET = withAuthServer(async function GET(
  req: AuthenticatedRequest
) {
  try {
    const packages = await makeBackendRequest<CreditPackage[]>(
      "/api/credits/packages",
      {
        method: "GET",
        sessionToken: req.auth.sessionToken,
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
