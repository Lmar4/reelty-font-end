import React from "react";
import { useCreateListing, useUploadPhoto } from "@/hooks/queries/use-listings";
import { toast } from "sonner";

interface NewListingModalProps {
  userId: string;
  onSuccess?: (listing: any) => void;
  onClose?: () => void;
}

interface ListingFormData {
  address: string;
  coordinates: { lat: number; lng: number } | null;
  photoLimit: number;
  photos?: Array<{ file: File; order: number }>;
}

const NewListingModal: React.FC<NewListingModalProps> = ({
  userId,
  onSuccess,
  onClose,
}) => {
  const createListingMutation = useCreateListing();
  const uploadPhotoMutation = useUploadPhoto();

  const handleSubmit = async (data: ListingFormData) => {
    try {
      // First create the listing
      const listing = await createListingMutation.mutateAsync({
        userId,
        address: data.address,
        coordinates: data.coordinates,
        photoLimit: data.photoLimit,
      });

      // Now we have the listing ID, upload photos
      if (data.photos?.length) {
        for (const photo of data.photos) {
          await uploadPhotoMutation.mutateAsync({
            listingId: listing.id,
            file: photo.file,
            order: photo.order,
          });
        }
      }

      toast.success("Listing created successfully!");
      onSuccess?.(listing);
      onClose?.();
    } catch (error) {
      console.error("[LISTING_CREATION_ERROR]", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create listing"
      );
    }
  };

  return <div>{/* Render your form here */}</div>;
};

export default NewListingModal;
