"use client";

import { useUserData } from "@/hooks/useUserData";
import { useListings } from "@/hooks/queries/use-listings";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Listing } from "@/types/prisma-types";

interface ListingsContextType {
  listings: Listing[] | undefined;
  isLoading: boolean;
  isCreatingListing: boolean;
  setIsCreatingListing: (value: boolean) => void;
}

const ListingsContext = createContext<ListingsContextType | undefined>(
  undefined
);

export function useListingsContext() {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error(
      "useListingsContext must be used within a ListingsProvider"
    );
  }
  return context;
}

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const { data: userData, isLoading: isUserLoading } = useUserData();
  const { data: listings, isLoading: isListingsLoading } = useListings();

  const isLoading = isUserLoading || isListingsLoading;

  return (
    <ListingsContext.Provider
      value={{
        listings,
        isLoading,
        isCreatingListing,
        setIsCreatingListing,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
}
