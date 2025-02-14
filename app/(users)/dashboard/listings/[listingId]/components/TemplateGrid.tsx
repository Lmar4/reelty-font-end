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
  templates = [],
  photos = [],
  isLoading,
  userTier,
  activeJobs = [],
  onGenerateVideo,
}: TemplateGridProps) {
  if (isLoading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <TemplateSkeleton key={i} />
        ))}
      </>
    );
  }

  // Get the first two photos for photo-based templates
  const photoTemplates = photos.slice(0, 2).map((photo, index) => {
    // Clean the URL by removing query parameters
    const url = photo.processedFilePath || photo.filePath;
    const cleanUrl = url.includes("?") ? url.split("?")[0] : url;

    return {
      id: `photo-${photo.id}`,
      name: `Photo Reel ${index + 1}`,
      description: "Generated from your photo",
      tiers: ["free"],
      order: 1000 + index, // High order number to ensure they appear last
      thumbnailUrl: cleanUrl,
    };
  });

  // Combine video templates with photo templates and sort by order
  const allTemplates = [...templates, ...photoTemplates]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .slice(0, 6); // Limit to 6 items total

  if (!allTemplates?.length) {
    return null;
  }

  return (
    <>
      {allTemplates.map((template) => {
        const isTemplateAvailable = template.tiers.includes(
          userTier.toLowerCase()
        );
        const isPhotoTemplate = template.id.startsWith("photo-");
        const activeJob = activeJobs.find((job) =>
          isPhotoTemplate
            ? job.inputFiles?.includes(template.thumbnailUrl)
            : job.template === template.id
        );
        const isProcessing = activeJob?.status === "PROCESSING";
        const isCompleted = activeJob?.status === "COMPLETED";
        const isFailed = activeJob?.status === "FAILED";

        return (
          <Card key={template.id} className='overflow-hidden group'>
            <div className='relative aspect-[9/16] bg-gray-100'>
              {template.thumbnailUrl ? (
                <Image
                  src={template.thumbnailUrl}
                  alt={template.name}
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 50vw, 25vw'
                />
              ) : (
                <div className='absolute inset-0 bg-muted' />
              )}
              {!isTemplateAvailable && (
                <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                  <span className='text-white text-sm font-medium px-3 py-1 bg-black/70 rounded-full'>
                    Pro
                  </span>
                </div>
              )}
            </div>
            <div className='p-4'>
              <h3 className='text-base font-medium'>{template.name}</h3>
              <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                {template.description}
              </p>
              {isProcessing ? (
                <div className='mt-4 space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Processing...</span>
                    <span className='text-muted-foreground'>
                      {activeJob.progress}%
                    </span>
                  </div>
                  <div className='w-full bg-gray-100 rounded-full h-1.5'>
                    <div
                      className='bg-blue-600 h-1.5 rounded-full transition-all duration-300'
                      style={{ width: `${activeJob.progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <Button
                  className='w-full mt-4'
                  variant={isCompleted ? "outline" : "default"}
                  disabled={!isTemplateAvailable || isProcessing}
                  onClick={() => onGenerateVideo(template.id)}
                >
                  {isCompleted
                    ? "Download HD"
                    : isFailed
                    ? "Try Again"
                    : !isTemplateAvailable
                    ? "Upgrade Required"
                    : "Generate Video"}
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </>
  );
}
