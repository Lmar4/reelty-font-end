"use client";

import Image from "next/image";
import Link from "next/link";
import FileUpload from "@/components/reelty/FileUpload";
import {
  useListings,
  useCreateListing,
  useUploadPhoto,
} from "@/hooks/queries/use-listings";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import AddressInput from "@/components/reelty/AddressInput";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCreateJob } from "@/hooks/use-jobs";
import { useTemplates } from "@/hooks/queries/use-templates";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/ui/loading-state";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const { data: listings, isLoading: isListingsLoading } = useListings(
    user?.id || ""
  );

  // State for the address modal and processing
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");

  // Mutations
  const createListing = useCreateListing();
  const uploadPhoto = useUploadPhoto();
  const createJob = useCreateJob();
  const { data: templates } = useTemplates("free"); // We'll use the first available template

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 10) {
      toast.error("Maximum 10 photos allowed");
      return;
    }
    setSelectedFiles(files);
    setIsAddressModalOpen(true);
  };

  const handleAddressSelect = async (
    address: string,
    coordinates: { lat: number; lng: number }
  ) => {
    if (!user?.id) {
      toast.error("Please sign in to create a listing");
      return;
    }

    setIsAddressModalOpen(false);
    setIsProcessing(true);
    setProgress(0);
    setProcessingStatus("Creating listing...");

    try {
      // Create the listing first
      const listing = await createListing.mutateAsync({
        userId: user.id,
        address,
        coordinates,
        photoLimit: 10,
      });

      if (!listing?.id) {
        throw new Error("Failed to create listing");
      }

      setProgress(20);
      setProcessingStatus("Uploading photos...");

      // Upload all photos
      const uploadPromises = selectedFiles.map((file, index) =>
        uploadPhoto.mutateAsync({
          file,
          listingId: listing.id,
          order: index,
        })
      );

      const uploadResults = await Promise.all(uploadPromises);
      const uploadedFilePaths = uploadResults.map((result) => result.filePath);

      setProgress(60);
      setProcessingStatus("Creating video job...");

      // Create video generation job using the first available template
      if (templates && templates.length > 0) {
        await createJob.mutateAsync({
          listingId: listing.id,
          template: templates[0].id,
          inputFiles: uploadedFilePaths,
        });
      }

      setProgress(100);
      setProcessingStatus("Complete!");

      // Redirect to the listing page after a brief delay
      setTimeout(() => {
        router.push(`/dashboard/listings/${listing.id}`);
        toast.success(
          "Listing created successfully! Video generation has started."
        );
      }, 1000);
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create listing"
      );
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
        {/* Header Section */}
        <div className='mb-0'>
          <Link
            href='/dashboard'
            className='text-[15px] text-[#1c1c1c]/60 hover:text-[#1c1c1c]/80 mb-2 block'
          >
            Dashboard
          </Link>
          <h1 className='text-[32px] font-semibold text-[#1c1c1c] mb-4 md:mb-8'>
            Your Listings
          </h1>
        </div>

        {/* Input Section */}
        <div className='mb-8'>
          <FileUpload
            buttonText='Create new listing Reels'
            onFilesSelected={handleFilesSelected}
            uploadUrl=''
            maxFiles={10}
          />
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className='mb-8'>
            <div className='bg-white rounded-lg p-6 shadow-lg'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold'>{processingStatus}</h3>
                <LoadingState size='sm' />
              </div>
              <Progress value={progress} className='h-2' />
            </div>
          </div>
        )}

        {/* Empty State */}
        {listings?.length === 0 && !isListingsLoading && !isProcessing && (
          <div className='mb-24'>
            <div className='bg-[#EDEDED] rounded-lg p-4 text-left'>
              <p className='text-[15px] text-[#1c1c1c]'>
                Create your first Reelty!
              </p>
              <p className='text-[14px] text-[#1c1c1c]/60'>
                You have not created any listing Reels yet.
              </p>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {listings && listings.length > 0 && (
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-8'>
            {listings.map((listing) => (
              <div key={listing.id}>
                <Link
                  href={`/dashboard/listings/${listing.id}`}
                  className='block'
                >
                  <div className='relative rounded-2xl overflow-hidden mb-4 group'>
                    <Image
                      src={
                        listing.photos?.[0]?.filePath ||
                        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"
                      }
                      alt={listing.address || "Listing image"}
                      width={800}
                      height={600}
                      className='w-full aspect-[4/3] object-cover'
                    />
                    <button
                      className='absolute top-2 md:top-4 right-2 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center hover:bg-white/90 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100'
                      aria-label='Listing options'
                    >
                      <svg
                        width='16'
                        height='16'
                        className='md:hidden'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='black'
                        strokeWidth='2'
                      >
                        <circle cx='12' cy='12' r='1' />
                        <circle cx='12' cy='5' r='1' />
                        <circle cx='12' cy='19' r='1' />
                      </svg>
                      <svg
                        width='20'
                        height='20'
                        className='hidden md:block'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='black'
                        strokeWidth='2'
                      >
                        <circle cx='12' cy='12' r='1' />
                        <circle cx='12' cy='5' r='1' />
                        <circle cx='12' cy='19' r='1' />
                      </svg>
                    </button>
                  </div>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='min-w-0'>
                      <h3 className='text-[14px] md:text-[18px] font-bold text-[#1c1c1c] leading-tight truncate'>
                        {listing.address}
                      </h3>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address Modal */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <div className='py-6'>
            <h2 className='text-xl font-semibold mb-4'>
              Enter Property Address
            </h2>
            <AddressInput onAddressSelect={handleAddressSelect} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
