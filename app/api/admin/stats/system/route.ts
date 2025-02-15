import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

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

export async function GET() {
  const user = await currentUser();

  // Check if user is admin
  if (user?.publicMetadata?.role !== "admin") {
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
