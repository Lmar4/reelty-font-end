import { NextResponse } from "next/server";
import { withAuth } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/api";
import { logger } from "@/utils/logger";

interface PhotoStatus {
  processingCount: number;
  failedCount: number;
  totalCount: number;
}

interface AuthenticatedRequest extends Request {
  auth: {
    sessionToken: string;
  };
}

export const GET = withAuth(
  async (
    req: AuthenticatedRequest,
    { params }: { params: Promise<{ listingId: string }> }
  ) => {
    try {
      const { listingId } = await params;
      const status = await makeBackendRequest<PhotoStatus>(
        `/api/listings/${listingId}/photos/status`,
        {
          method: "GET",
          sessionToken: req.auth.sessionToken,
        }
      );

      return NextResponse.json(status);
    } catch (error) {
      logger.error("[PHOTOS_STATUS_ERROR]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }
);
