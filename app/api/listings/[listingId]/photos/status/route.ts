import { withAuthServer, AuthenticatedRequest } from "@/utils/withAuthServer";
import { makeBackendRequest } from "@/utils/withAuth";
import { logger } from "@/utils/logger";
import { NextResponse } from "next/server";

interface PhotoStatus {
  processingCount: number;
  failedCount: number;
  totalCount: number;
}

export const GET = withAuthServer(
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
