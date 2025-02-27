import PricingCards from "@/components/reelty/PricingCards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SubscriptionTier } from "@/constants/subscription-tiers";
import { Template, useTemplates } from "@/hooks/queries/use-templates";
import { cn } from "@/lib/utils";
import { VideoJob } from "@/types/listing-types";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ProcessedTemplate {
  key: string;
  path: string;
}

interface PhotoStatus {
  id: string;
  url: string;
  hasError: boolean;
  status: "error" | "processing" | "completed";
  order: number;
}

interface TemplateGridProps {
  videoJobs: VideoJob[];
  photos: PhotoStatus[];
  isLoading: boolean;
  userTier: string;
  activeJobs: VideoJob[];
  onGenerateVideo: (templateId: string) => void;
  onDownload?: (jobId: string) => void;
  isGenerating?: boolean;
  downloadCount?: number;
}

export const TemplateGrid: React.FC<TemplateGridProps> = ({
  videoJobs,
  photos,
  isLoading: isLoadingProps,
  userTier,
  activeJobs,
  onGenerateVideo,
  onDownload,
  isGenerating = false,
}) => {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const isFreeTier = userTier === SubscriptionTier.FREE;

  // Fetch templates
  const { data: templatesResponse, isLoading: isLoadingTemplates } =
    useTemplates();
  const isLoading = isLoadingProps || isLoadingTemplates;

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {[...Array(6)].map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <div className='aspect-[9/16] bg-gray-200' />
            <div className='p-4 space-y-3'>
              <div className='h-4 bg-gray-200 rounded w-1/2' />
              <div className='h-8 bg-gray-200 rounded' />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!templatesResponse?.data) {
    return null;
  }

  const templates: Template[] = Array.isArray(templatesResponse.data)
    ? templatesResponse.data
    : [];

  // Get a random photo URL to use as fallback thumbnail
  const getRandomPhotoUrl = () => {
    if (!photos || photos.length === 0) return null;
    const completedPhotos = photos.filter(
      (p) => p.status === "completed" && !p.hasError
    );
    if (completedPhotos.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * completedPhotos.length);
    return completedPhotos[randomIndex].url;
  };

  // Get video URL for a specific template from the metadata
  const getVideoUrlForTemplate = (template: Template, job: VideoJob) => {
    // First check if this is the main template's video
    if (job.template === template.key && job.outputFile) {
      return job.outputFile;
    }

    // Then check in processedTemplates
    const processedVideo = job.metadata?.processedTemplates?.find(
      (t: ProcessedTemplate) =>
        t.key === template.key || t.path.includes(`/${template.key}.mp4`)
    );

    return processedVideo?.path;
  };

  // Group jobs by template and get the latest job for each template
  const latestJobsByTemplate = videoJobs.reduce<Record<string, VideoJob>>(
    (acc, job) => {
      if (!job.template) return acc;

      // If we don't have this template yet, or if this job is newer than what we have
      if (
        !acc[job.template] ||
        new Date(job.createdAt) > new Date(acc[job.template].createdAt)
      ) {
        acc[job.template] = job;
      }
      return acc;
    },
    {}
  );

  const handleDownloadClick = (templateKey: string, job: VideoJob) => {
    if (!job) return;

    const template = templates.find((t) => t.key === templateKey);
    const isPremium = template?.tiers.includes("pro");

    if (isPremium && isFreeTier) {
      setShowPricingModal(true);
    } else if (onDownload) {
      onDownload(job.id);
    }
  };

  // Get the main job that contains all processed videos
  const mainJob = Object.values(latestJobsByTemplate).find(
    (job) =>
      job.metadata?.processedTemplates?.length &&
      job.metadata?.processedTemplates?.length > 0
  );

  const fallbackThumbnail = getRandomPhotoUrl();

  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {[...templates]
          .sort((a: Template, b: Template) => {
            // First sort by FREE vs PRO
            const aIsFree = a.tiers.includes("FREE");
            const bIsFree = b.tiers.includes("FREE");
            if (aIsFree !== bIsFree) {
              return aIsFree ? -1 : 1;
            }
            // Then sort by order within each group
            return a.order - b.order;
          })
          .map((template: Template) => {
            const latestJob = mainJob || latestJobsByTemplate[template.key];
            const isProcessing = activeJobs.some(
              (job) =>
                job.template === template.key &&
                (job.status === "PROCESSING" || job.status === "PENDING")
            );

            const videoUrl = latestJob
              ? getVideoUrlForTemplate(template, latestJob)
              : null;
            const isPremium = !template.tiers.includes("FREE") && isFreeTier;

            return (
              <Card
                key={template.key}
                className={cn(
                  "overflow-hidden rounded-lg",
                  isPremium && "opacity-90"
                )}
              >
                <div className='relative bg-gray-100 aspect-[9/16]'>
                  {videoUrl && !isPremium ? (
                    <video
                      src={videoUrl}
                      className='w-full h-full object-cover'
                      controls
                      poster={
                        template.thumbnailUrl || fallbackThumbnail || undefined
                      }
                    />
                  ) : (
                    <div
                      className={cn(
                        "relative w-full h-full",
                        isPremium && "grayscale"
                      )}
                    >
                      <video
                        src={videoUrl || undefined}
                        className='w-full h-full object-cover'
                        poster={
                          template.thumbnailUrl ||
                          fallbackThumbnail ||
                          undefined
                        }
                      />
                    </div>
                  )}
                </div>

                <div className='p-4'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-[15px] font-medium text-gray-900 flex w-full justify-between'>
                      {template.name}
                      {!template.tiers.includes("FREE") && (
                        <Badge
                          variant='outline'
                          className='ml-2 bg-black text-white text-[11px] font-medium px-1.5 py-0.5 rounded'
                        >
                          Pro
                        </Badge>
                      )}
                    </h3>
                  </div>

                  <Button
                    onClick={() =>
                      latestJob?.status === "COMPLETED"
                        ? handleDownloadClick(template.key, latestJob)
                        : onGenerateVideo(template.key)
                    }
                    disabled={
                      isProcessing ||
                      !photos.length ||
                      isGenerating ||
                      isPremium
                    }
                    className={cn(
                      "w-full bg-black hover:bg-black/90 text-white",
                      isPremium &&
                        "bg-gray-200 hover:bg-gray-200 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    {isProcessing ? (
                      <div className='flex items-center justify-center space-x-2'>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        <span>Generating...</span>
                      </div>
                    ) : (
                      "Download HD"
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
      </div>

      <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
        <DialogContent className='max-w-4xl'>
          <PricingCards
            isModal
            currentTier={userTier}
            onUpgradeComplete={() => setShowPricingModal(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
