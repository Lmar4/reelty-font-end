import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ListingPageClient from "./ListingPageClient";
import { LoadingState } from "@/components/ui/loading-state";
import { ensureUserDefaultTier } from "@/utils/subscription";

interface PageProps {
  params: Promise<{ listingId: string }>; // params is a Promise
  searchParams:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | undefined; // searchParams is a Promise or undefined
}

export default async function ListingPage({ params, searchParams }: PageProps) {
  // Await the params to get the actual values
  const { listingId } = await params;

  // Await searchParams if you need to use it (optional in this case since you're not using it yet)
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      redirect("/sign-in");
    }

    const sessionToken = await getToken();
    if (!sessionToken) {
      redirect("/sign-in");
    }

    // Get default tier info from our frontend utility
    const defaultTier = await ensureUserDefaultTier(userId, sessionToken);
    console.log("defaultTier", defaultTier);

    return (
      <Suspense fallback={<LoadingState />}>
        <ListingPageClient listingId={listingId} fallbackTier={defaultTier} />
      </Suspense>
    );
  } catch (error) {
    // Handle any errors gracefully
    console.error("Error in ListingPage:", error);
    return (
      <div className='p-4 text-center'>
        <h2 className='text-xl font-semibold text-red-600'>
          Something went wrong
        </h2>
        <p className='text-gray-600 mt-2'>Please try refreshing the page</p>
      </div>
    );
  }
}
