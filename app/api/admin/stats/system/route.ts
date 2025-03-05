import { NextRequest, NextResponse } from "next/server";
import { withAuthServer } from "@/utils/withAuthServer";
import { AuthenticatedRequest } from "@/utils/types";

// Mock data generator for system stats
const generateMockStats = () => {
  return {
    cpuUsage: Math.random() * 100,
    memoryUsage: Math.random() * 100,
    diskUsage: Math.random() * 100,
    networkUsage: Math.random() * 100,
    timestamp: new Date().toISOString(),
  };
};

// Handler function
async function getSystemStats(request: AuthenticatedRequest) {
  // Check if user is admin
  if (request.auth.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // For now, return mock data
    // In production, this should be replaced with real system metrics
    const mockData = Array.from({ length: 24 }, generateMockStats);

    return NextResponse.json(mockData);
  } catch (error) {
    console.error("[SYSTEM_STATS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Next.js App Router handler
export async function GET(req: NextRequest) {
  const authHandler = await withAuthServer(getSystemStats);
  return authHandler(req);
}
