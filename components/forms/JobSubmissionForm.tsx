"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { handleError } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { TRPCClientErrorLike } from "@trpc/client";
import { toast } from "sonner";

interface JobSubmissionFormProps {
  listingId: string;
  userId: string;
  onSuccess?: (jobId: string) => void;
  className?: string;
  selectedPhotos?: string[];
  template?: string;
}

export default function JobSubmissionForm({
  listingId,
  userId,
  onSuccess,
  className = "",
  selectedPhotos = [],
  template = "crescendo",
}: JobSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitJobMutation = trpc.jobs.submit.useMutation({
    onSuccess: (job) => {
      toast.success("Video generation job submitted successfully!");
      onSuccess?.(job.id);
    },
    onError: (error: TRPCClientErrorLike<any>) => {
      handleError(error, {
        fallbackMessage: "Failed to submit video generation job",
      });
    },
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await submitJobMutation.mutateAsync({
        userId,
        listingId,
        inputFiles: selectedPhotos,
        template,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Create Video</h3>
        <p className='text-sm text-gray-500'>
          Generate a video showcase for your listing using AI
        </p>
        {selectedPhotos.length > 0 ? (
          <p className='text-sm text-gray-600'>
            {selectedPhotos.length} photo
            {selectedPhotos.length !== 1 ? "s" : ""} selected
          </p>
        ) : (
          <p className='text-sm text-yellow-600'>
            No photos selected. Please select photos to generate a video.
          </p>
        )}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || selectedPhotos.length === 0}
          className='w-full'
          aria-label='Submit job'
        >
          {isSubmitting ? (
            <>
              <Loader2
                className='mr-2 h-4 w-4 animate-spin'
                data-testid='loading-spinner'
              />
              Processing...
            </>
          ) : (
            "Generate Video"
          )}
        </Button>
      </div>
    </Card>
  );
}
