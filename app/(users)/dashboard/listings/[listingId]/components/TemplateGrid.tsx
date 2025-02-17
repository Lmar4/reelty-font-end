import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { VideoJob, VideoTemplate, Photo } from "@/types/listing-types";
import { TemplateSkeleton } from "./TemplateSkeleton";

interface TemplateGridProps {
  templates?: VideoTemplate[];
  photos?: Photo[];
  isLoading?: boolean;
  userTier: string;
  activeJobs?: VideoJob[];
  onGenerateVideo: (templateId: string) => void;
}

export function TemplateGrid({
  templates,
  photos,
  isLoading,
  userTier,
  activeJobs = [],
  onGenerateVideo,
}: TemplateGridProps) {
  // Check if any job is currently processing
  const isProcessing = activeJobs.some(
    (job) => job.status === "PROCESSING" || job.status === "QUEUED"
  );

  if (isLoading || !templates) {
    return (
      <>
        <TemplateSkeleton />
        <TemplateSkeleton />
        <TemplateSkeleton />
      </>
    );
  }

  // If processing, show a loading state with more information
  if (isProcessing) {
    const processingJob = activeJobs.find(
      (job) => job.status === "PROCESSING" || job.status === "QUEUED"
    );

    return (
      <div className='col-span-full'>
        <Card className='p-6 space-y-4'>
          <div className='flex items-center space-x-4'>
            <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center'>
              <Loader2 className='w-6 h-6 text-blue-600 animate-spin' />
            </div>
            <div>
              <h3 className='text-lg font-semibold'>Generating Your Video</h3>
              <p className='text-sm text-gray-500'>
                {processingJob?.metadata?.stage === "webp"
                  ? "Optimizing your photos for the best quality..."
                  : processingJob?.metadata?.stage === "runway"
                  ? "Applying AI enhancements to your photos..."
                  : processingJob?.metadata?.stage === "template"
                  ? "Creating your video with the selected template..."
                  : processingJob?.metadata?.stage === "final"
                  ? "Finalizing your video..."
                  : "Processing your video..."}
              </p>
            </div>
          </div>

          <div className='space-y-2'>
            <div className='w-full bg-gray-100 rounded-full h-2'>
              <div
                className='bg-blue-600 h-2 rounded-full transition-all duration-500'
                style={{ width: `${processingJob?.progress || 0}%` }}
              />
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Progress: {processingJob?.progress || 0}%</span>
              {processingJob?.metadata?.currentFile &&
                processingJob?.metadata?.totalFiles && (
                  <span>
                    Processing file {processingJob.metadata.currentFile} of{" "}
                    {processingJob.metadata.totalFiles}
                  </span>
                )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      {templates.map((template) => {
        const isGenerating = activeJobs.some(
          (job) =>
            job.template === template.id &&
            (job.status === "PROCESSING" || job.status === "QUEUED")
        );

        return (
          <Card
            key={template.id}
            className='relative overflow-hidden group hover:shadow-lg transition-shadow duration-200'
          >
            {template.thumbnailUrl && (
              <div className='relative aspect-video'>
                <Image
                  src={template.thumbnailUrl}
                  alt={template.name}
                  fill
                  className='object-cover'
                />
              </div>
            )}
            <div className='p-4'>
              <h3 className='font-semibold'>{template.name}</h3>
              <p className='text-sm text-gray-500 mt-1'>
                {template.description}
              </p>
              <Button
                onClick={() => onGenerateVideo(template.id)}
                disabled={isGenerating || !photos?.length}
                className='w-full mt-4'
              >
                {isGenerating ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Generating...
                  </>
                ) : (
                  "Generate Video"
                )}
              </Button>
            </div>
          </Card>
        );
      })}
    </>
  );
}
