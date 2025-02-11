import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

// Admin tier ID constant
const ADMIN_TIER_ID = "550e8400-e29b-41d4-a716-446655440003";

// Mock data generator for recent activity
const generateMockActivity = (index: number) => {
  const types = [
    "login",
    "video_generation",
    "subscription_change",
    "listing_created",
  ];
  const descriptions = [
    "User logged in",
    "Generated new property video",
    "Upgraded to premium plan",
    "Created new property listing",
  ];

  return {
    id: `act_${index}`,
    type: types[index % types.length],
    description: descriptions[index % descriptions.length],
    userId: `user_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date(Date.now() - index * 3600000).toISOString(), // Each activity 1 hour apart
  };
};

export async function GET() {
  const user = await currentUser();

  // Check if user is admin
  if (!user || user.publicMetadata.currentTierId !== ADMIN_TIER_ID) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // For now, return mock data
    // In production, this should be connected to a real activity tracking system
    const mockData = Array.from({ length: 10 }, (_, i) =>
      generateMockActivity(i)
    );

    return NextResponse.json(mockData);
  } catch (error) {
    console.error("[RECENT_ACTIVITY]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
