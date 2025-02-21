import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export const GET = withAuthServer(async function GET(
  request: AuthenticatedRequest
) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return new NextResponse("Customer ID is required", { status: 400 });
    }

    const paymentMethods = await makeBackendRequest<PaymentMethod[]>(
      `/api/payment/methods?customerId=${customerId}`,
      {
        method: "GET",
        sessionToken: request.auth.sessionToken,
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
});
