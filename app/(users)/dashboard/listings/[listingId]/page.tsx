import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ListingPageClient from "./ListingPageClient";
import { LoadingState } from "@/components/ui/loading-state";

interface PageProps {
  params: Promise<{ listingId: string }>;
}

export default async function ListingPage({ params }: PageProps) {
  const { userId } = await auth();
  const paramsToListingId = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className='flex-1 space-y-4 p-8 pt-6'>
      <Suspense fallback={<LoadingState />}>
        <ListingPageClient listingId={paramsToListingId.listingId} />
      </Suspense>
    </div>
  );
}
