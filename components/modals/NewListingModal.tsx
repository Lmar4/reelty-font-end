"use client";

import FileUpload from "@/components/reelty/FileUpload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader } from "@googlemaps/js-api-loader";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface NewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFiles?: File[];
}

export function NewListingModal({
  isOpen,
  onClose,
  initialFiles = [],
}: NewListingModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const tempUploadMutation = trpc.property.tempUpload.useMutation();
  const convertToListingMutation =
    trpc.property.convertTempToListing.useMutation();

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: "weekly",
      libraries: ["places"],
    });

    loader
      .load()
      .then(() => {
        if (inputRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(
            inputRef.current,
            {
              types: ["address"],
              componentRestrictions: { country: "us" },
            }
          );

          autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current?.getPlace();
            if (place?.formatted_address) {
              setAddress(place.formatted_address);
            }
          });
        }
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error);
      });

    return () => {
      // Cleanup
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const handleGenerate = async () => {
    if (!files.length || !address) return;

    setIsLoading(true);
    try {
      // If user is not logged in, store files temporarily and redirect to login
      if (!user) {
        // Transform files to match the expected schema
        const transformedFiles = files.map(file => ({
          filePath: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          contentType: file.type
        }));

        const result = await tempUploadMutation.mutateAsync({
          files: transformedFiles,
          address
        });

        // Store the listing ID in localStorage
        localStorage.setItem("pendingListingSession", result.id);
        router.push("/login");
        return;
      }

      // If user is logged in and we have a pending session, convert it to a listing
      if (sessionId) {
        await convertToListingMutation.mutateAsync({
          userId: user.uid
        });
        localStorage.removeItem("pendingListingSession");
      } else {
        // Create listing directly
        // Implementation depends on your file upload logic
      }

      onClose();
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating listing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Create New Listing</DialogTitle>
        </DialogHeader>

        <div className='grid gap-6 py-4'>
          <FileUpload
            buttonText='Select or drag photos'
            onFilesSelected={handleFilesSelected}
          />

          <div className='relative'>
            <Input
              ref={inputRef}
              type='text'
              placeholder='Enter address'
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!files.length || !address || isLoading}
            className='w-full'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
