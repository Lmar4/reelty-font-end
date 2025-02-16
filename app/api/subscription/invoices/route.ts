import { NextResponse } from "next/server";
import {
  withAuth,
  makeBackendRequest,
  AuthenticatedRequest,
} from "@/utils/withAuth";
import Stripe from "stripe";

interface Invoice {
  id: string;
  created: number;
  amount_paid: number;
  status: string;
  invoice_pdf: string | null;
}

interface InvoicesResponse {
  invoices: Invoice[];
  has_more: boolean;
}

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = searchParams.get("limit") || "10";
    const starting_after = searchParams.get("starting_after");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Users can only view their own invoices
    if (request.auth.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const invoices = await makeBackendRequest<InvoicesResponse>(
      `/api/subscription/invoices/${userId}`,
      {
        sessionToken: request.auth.sessionToken,
        headers: {
          "X-Pagination-Limit": limit,
          ...(starting_after && { "X-Pagination-After": starting_after }),
        },
      }
    );

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("[SUBSCRIPTION_INVOICES_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
});
