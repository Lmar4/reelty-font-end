import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { withAdminAuth } from "@/utils/withAuthServer";
import { AuthenticatedRequest } from "@/utils/types";

/**
 * Syncs all users from Clerk to our database
 * This is an admin-only endpoint that fetches all users from Clerk
 * and syncs them to our database
 */
async function syncUsers(request: AuthenticatedRequest) {
  try {
    console.log("[SYNC_USERS] Starting user sync process");

    // Get the Clerk client
    const clerk = await clerkClient();

    // Get the total number of users to determine pagination
    const userCount = await clerk.users.getCount();
    console.log(`[SYNC_USERS] Total users in Clerk: ${userCount}`);

    // Define batch size for processing
    const batchSize = 100;
    const totalBatches = Math.ceil(userCount / batchSize);

    let syncedCount = 0;
    let failedCount = 0;
    const failedUsers: string[] = [];

    // Process users in batches to avoid memory issues
    for (let batch = 0; batch < totalBatches; batch++) {
      console.log(`[SYNC_USERS] Processing batch ${batch + 1}/${totalBatches}`);

      // Fetch users for this batch
      const usersResponse = await clerk.users.getUserList({
        limit: batchSize,
        offset: batch * batchSize,
      });

      // Process each user in the batch
      for (const user of usersResponse.data) {
        try {
          const email = user.emailAddresses[0]?.emailAddress;

          if (!email) {
            console.warn(
              `[SYNC_USERS] User ${user.id} has no email address, skipping`
            );
            failedCount++;
            failedUsers.push(user.id);
            continue;
          }

          // Sync user with our backend
          const response = await fetch(`${process.env.BACKEND_URL}/api/users`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${request.auth.sessionToken}`,
            },
            body: JSON.stringify({
              id: user.id,
              email,
              firstName: user.firstName,
              lastName: user.lastName,
            }),
          });

          if (!response.ok) {
            throw new Error(
              `Failed to sync user ${user.id}: ${await response.text()}`
            );
          }

          syncedCount++;
        } catch (error) {
          console.error(`[SYNC_USERS] Error syncing user ${user.id}:`, error);
          failedCount++;
          failedUsers.push(user.id);
        }
      }
    }

    console.log(
      `[SYNC_USERS] Sync completed. Synced: ${syncedCount}, Failed: ${failedCount}`
    );

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: userCount,
        syncedUsers: syncedCount,
        failedUsers: failedCount,
        failedUserIds: failedUsers,
      },
    });
  } catch (error) {
    console.error("[SYNC_USERS_ERROR]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    );
  }
}

// Next.js App Router handlers
export async function POST(req: NextRequest) {
  const authHandler = await withAdminAuth(syncUsers);
  return authHandler(req);
}
