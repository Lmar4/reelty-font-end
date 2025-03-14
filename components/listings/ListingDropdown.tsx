"use client";

import { useToast } from "@/components/common/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DeleteConfirmationModal } from "../modals/DeleteConfirmationModal";
import { useUser } from "@clerk/nextjs";
import { LISTINGS_QUERY_KEY } from "@/hooks/queries/use-listings";

interface ListingDropdownProps {
  listingId: string;
}

export const ListingDropdown = ({ listingId }: ListingDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);

    // Store the previous data for rollback
    const previousData = queryClient.getQueryData([
      LISTINGS_QUERY_KEY,
      user?.id,
    ]);

    // Optimistically update the UI
    queryClient.setQueryData([LISTINGS_QUERY_KEY, user?.id], (oldData: any) => {
      if (!oldData) return oldData;
      const listings = Array.isArray(oldData) ? oldData : oldData?.data;
      if (!listings) return oldData;

      const updatedListings = listings.filter(
        (listing: any) => listing.id !== listingId
      );
      return Array.isArray(oldData)
        ? updatedListings
        : { ...oldData, data: updatedListings };
    });

    try {
      // Use the correct API endpoint
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      });

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({ error: "Failed to parse response" }));
        const errorMessage =
          data.error || `Failed to delete listing: ${response.status}`;
        console.error("[DELETE_ERROR]", { status: response.status, data });
        throw new Error(errorMessage);
      }

      // Successfully deleted
      // Remove the individual listing from cache if it exists
      queryClient.removeQueries({ queryKey: [LISTINGS_QUERY_KEY, listingId] });

      // Invalidate the listings query to refetch the latest data
      queryClient.invalidateQueries({
        queryKey: [LISTINGS_QUERY_KEY, user?.id],
      });

      showToast("Listing deleted successfully", "success");
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData([LISTINGS_QUERY_KEY, user?.id], previousData);
      console.error("[DELETE_ERROR]", error);
      showToast(
        error instanceof Error ? error.message : "Failed to delete listing",
        "error"
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className='relative'>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className='p-2 hover:bg-black/5 rounded-lg transition-colors'
        aria-label='Listing options'
        tabIndex={0}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={2}
          stroke='currentColor'
          className='w-5 h-5'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z'
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-10'
            onClick={() => setIsOpen(false)}
          ></div>
          <div className='absolute right-0 mt-1 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-20'>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowDeleteConfirm(true);
                setIsOpen(false);
              }}
              className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:rounded-lg'
              tabIndex={0}
              aria-label='Delete listing'
            >
              Delete
            </button>
          </div>
        </>
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};
