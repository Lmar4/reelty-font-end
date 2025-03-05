import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

// Handler function
async function getPaymentMethods(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return new NextResponse("Customer ID is required", { status: 400 });
    }

    const paymentMethods = await makeBackendRequest<PaymentMethod[]>(
      `/api/payment/methods?customerId=${customerId}`,
      {
        method: "GET",
        sessionToken: req.auth.sessionToken,
      }
    );

    return NextResponse.json({ data: paymentMethods });
  } catch (error) {
    console.error("[PAYMENT_METHODS_GET]", error);
    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to fetch payment methods",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getPaymentMethods);
  return authHandler(req);
}
