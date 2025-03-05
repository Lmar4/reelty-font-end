import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { AuthenticatedRequest } from "@/utils/types";

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

// Handler function
async function getInvoices(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
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
    if (req.auth.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const queryParams = new URLSearchParams();
    queryParams.append("userId", userId);
    queryParams.append("limit", limit);
    if (starting_after) {
      queryParams.append("starting_after", starting_after);
    }

    const data = await makeBackendRequest<InvoicesResponse>(
      `/api/subscription/invoices?${queryParams.toString()}`,
      {
        method: "GET",
        sessionToken: req.auth.sessionToken,
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("[INVOICES_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Failed to fetch invoices",
      { status: 500 }
    );
  }
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getInvoices);
  return authHandler(req);
}
