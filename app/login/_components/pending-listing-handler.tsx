"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useUser } from "@clerk/nextjs";

interface PendingListingHandlerProps {
  children: React.ReactNode;
}

export function PendingListingHandler({
  children,
}: PendingListingHandlerProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const { mutate: convertListing } =
    trpc.property.convertTempToListing.useMutation({
      onSuccess: () => {
        localStorage.removeItem("preAuthListingData");
        router.push("/dashboard");
      },
    });

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) return;

    const storedData = localStorage.getItem("preAuthListingData");
    if (storedData) {
      const listingData = JSON.parse(storedData);
      convertListing({
        userId: user.id,
        ...listingData,
      });
    }
  }, [user, isLoaded, convertListing]);

  return <>{children}</>;
}
