import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ListingPageClient from "./ListingPageClient";
import { LoadingState } from "@/components/ui/loading-state";
import { ensureUserDefaultTier } from "@/utils/subscription";

interface PageProps {
  params: {
    listingId: string;
  };
}

export default async function ListingPage({ params }: PageProps) {
  try {
    const { userId, getToken } = await auth();
    const paramsToListingId = await params;

    if (!userId) {
      redirect("/sign-in");
    }

    const sessionToken = await getToken();
    if (!sessionToken) {
      redirect("/sign-in");
    }

    // Get default tier info from our frontend utility
    const defaultTier = await ensureUserDefaultTier(userId, sessionToken);

    return (
      <Suspense fallback={<LoadingState />}>
        <ListingPageClient
          listingId={paramsToListingId.listingId}
          fallbackTier={defaultTier}
        />
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
