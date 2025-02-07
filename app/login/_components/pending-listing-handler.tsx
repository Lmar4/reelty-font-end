"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";

interface PendingListingHandlerProps {
  children: React.ReactNode;
}

async function convertTempToListing(data: {
  userId: string;
  [key: string]: any;
}): Promise<void> {
  const response = await fetch("/api/listings/convert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to convert listing");
  }
}

export function PendingListingHandler({
  children,
}: PendingListingHandlerProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const { mutate: convertListing } = useMutation({
    mutationFn: convertTempToListing,
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
