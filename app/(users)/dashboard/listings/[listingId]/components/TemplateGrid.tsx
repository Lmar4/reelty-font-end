import PricingCards from "@/components/reelty/PricingCards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { SubscriptionTier } from "@/constants/subscription-tiers";
import { Template, useTemplates } from "@/hooks/queries/use-templates";
import { cn } from "@/lib/utils";
import { VideoJob } from "@/types/listing-types";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { SubscriptionTierId } from "@/types/prisma-types";

export interface JobProgress {
  stage: "runway" | "template" | "upload" | "vision";
  subStage?: string;
  progress: number;
  message?: string;
  error?: string;
}

// Helper function to generate user-friendly progress messages
const getProgressMessage = (progress: JobProgress): string => {
  const stageMessages: Record<string, string> = {
    runway: "Analyzing video",
    template: "Creating template",
    upload: "Finalizing video",
    vision: "Processing images",
  };

  return (
    progress.message || stageMessages[progress.stage] || "Processing video"
  );
};

interface ProcessedTemplate {
  key: string;
  path: string;
  usedFallback?: boolean;
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
  onDownload?: (jobId: string, templateKey: string) => void;
  isGenerating?: boolean;
  downloadCount?: number;
  jobProgress?: JobProgress;
  downloadingTemplate?: string | null;
  onUpgradeClick?: () => void;
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
  downloadCount = 0,
  jobProgress,
  downloadingTemplate = null,
  onUpgradeClick,
}) => {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [notifyWhenReady, setNotifyWhenReady] = useState(false);
  const isFreeTier =
    userTier === SubscriptionTier.FREE || userTier === SubscriptionTierId.FREE;
  const hasReachedFreeDownloadLimit = isFreeTier && downloadCount >= 1;

  // Fetch templates
  const { data: templatesResponse, isLoading: isLoadingTemplates } =
    useTemplates();
  const isLoading = isLoadingProps || isLoadingTemplates;

  // State to track if we've detected active jobs and should show progress UI
  const [showProgressUI, setShowProgressUI] = useState(false);
  
  // Effect to detect active jobs and commit to showing progress UI
  useEffect(() => {
    if (jobProgress || (activeJobs && activeJobs.length > 0) || isGenerating) {
      setShowProgressUI(true);
    }
  }, [jobProgress, activeJobs, isGenerating]);

  // If we're still loading, show an appropriate loading UI
  if (isLoading) {
    // Calculate estimated time based on active jobs
    const estimateRemainingTime = () => {
      // If we have active jobs, use their count to estimate time
      if (activeJobs.length > 0) {
        // Roughly 2 minutes per job as a baseline
        return Math.max(2, Math.ceil(activeJobs.length * 1.5));
      }
      return 5; // Default fallback of 5 minutes
    };

    // Calculate a more realistic progress percentage
    const estimateProgress = () => {
      if (jobProgress) {
        return Math.round(jobProgress.progress);
      }

      // If we have active jobs, estimate based on their status
      if (activeJobs.length > 0) {
        const pendingJobs = activeJobs.filter(
          (job) => job.status === "PENDING"
        ).length;
        const processingJobs = activeJobs.filter(
          (job) => job.status === "PROCESSING"
        ).length;
        const totalJobs = activeJobs.length;

        // Simple formula: completed jobs contribute more to progress
        const progress =
          ((totalJobs - pendingJobs) * 15 + processingJobs * 10) / totalJobs;
        return Math.min(95, Math.max(5, Math.round(progress)));
      }

      return 12; // More realistic starting percentage than 8%
    };

    // If we've detected active jobs or have committed to showing progress UI
    if (showProgressUI || jobProgress || (activeJobs && activeJobs.length > 0) || isGenerating) {
      const progressValue = jobProgress
        ? jobProgress.progress
        : estimateProgress();
      const remainingMinutes = jobProgress
        ? Math.ceil((100 - progressValue) / 15) // Rough estimate: 15% per minute
        : estimateRemainingTime();

      return (
        <div className='w-full max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-sm transition-opacity duration-300 ease-in-out'>
          <div className='mb-8'>
            <h2 className='text-3xl font-bold mb-2'>Your video</h2>
            <div className='flex items-center justify-between mb-2'>
              <p className='text-2xl font-bold'>{progressValue}%</p>
              <div className='flex items-center'>
                <span className='text-gray-600 mr-2'>
                  Notify me when it's ready
                </span>
                <div className='relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full'>
                  <input
                    type='checkbox'
                    id='notify-toggle'
                    checked={notifyWhenReady}
                    onChange={() => setNotifyWhenReady(!notifyWhenReady)}
                    className='absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border-4 rounded-full appearance-none cursor-pointer border-gray-300 checked:border-blue-500 checked:translate-x-full focus:outline-none'
                    aria-label='Notify me when video is ready'
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setNotifyWhenReady(!notifyWhenReady);
                      }
                    }}
                  />
                  <label
                    htmlFor='notify-toggle'
                    className='block w-full h-full overflow-hidden rounded-full cursor-pointer bg-gray-300'
                  ></label>
                </div>
              </div>
            </div>
            <div className='mb-2'>
              <Progress value={progressValue} className='h-2 bg-gray-200' />
            </div>
            <p className='text-gray-600'>
              {jobProgress ? getProgressMessage(jobProgress) : "Analyzing video"}.
              {remainingMinutes} {remainingMinutes === 1 ? "minute" : "minutes"}{" "}
              remaining. You can leave this page, we will email you when it's
              ready!
            </p>
          </div>
        </div>
      );
    }

    // If no active jobs detected yet, show a skeleton loading UI that resembles the progress UI
    return (
      <div className='w-full max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-sm transition-opacity duration-300 ease-in-out'>
        <div className='mb-8'>
          <h2 className='text-3xl font-bold mb-2'>Your video</h2>
          <div className='flex items-center justify-between mb-2'>
            <div className='w-16 h-8 bg-gray-200 rounded animate-pulse'></div>
            <div className='flex items-center'>
              <div className='w-40 h-6 bg-gray-200 rounded animate-pulse mr-2'></div>
              <div className='w-10 h-6 bg-gray-300 rounded-full'></div>
            </div>
          </div>
          <div className='mb-2'>
            <div className='h-2 bg-gray-200 rounded-full w-full'></div>
          </div>
          <div className='w-full h-6 bg-gray-200 rounded animate-pulse'></div>
        </div>
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

  // Get a template-specific placeholder image
  const getTemplatePlaceholder = (templateKey: string) => {
    if (!photos || photos.length === 0) return null;

    const completedPhotos = photos.filter(
      (p) => p.status === "completed" && !p.hasError
    );

    if (completedPhotos.length === 0) return null;

    // For specific templates, we can choose appropriate photos
    if (templateKey === "google-zoom") {
      // For Google Zoom, use the first photo (usually the main/exterior shot)
      const sortedPhotos = [...completedPhotos].sort(
        (a, b) => a.order - b.order
      );
      return sortedPhotos[0]?.url;
    }

    if (templateKey === "wes-anderson") {
      // For Wes Anderson, use a photo from the middle of the collection (often interior)
      const middleIndex = Math.floor(completedPhotos.length / 2);
      return completedPhotos[middleIndex]?.url;
    }

    // For other templates, use photos based on their order
    const photosByOrder = new Map<number, PhotoStatus>();
    completedPhotos.forEach((photo) => {
      photosByOrder.set(photo.order, photo);
    });

    // Try to get photos in this order preference (common for real estate)
    const orderPreference = [0, 1, 2, 3, 4]; // Exterior, main interior, kitchen, etc.

    for (const order of orderPreference) {
      if (photosByOrder.has(order)) {
        return photosByOrder.get(order)?.url;
      }
    }

    // Fallback to random photo
    return getRandomPhotoUrl();
  };

  // Get video URL for a specific template from the metadata
  const getVideoUrlForTemplate = (template: Template, job: VideoJob) => {
    // First check if this is the main template's video
    if (job.template === template.key && job.outputFile) {
      return job.outputFile;
    }

    // Then check in processedTemplates
    const processedVideo = job.metadata?.processedTemplates?.find(
      (t: any) =>
        t.key === template.key || t.path.includes(`/${template.key}.mp4`)
    ) as ProcessedTemplate | undefined;

    // If we have a processed video but it used a fallback image, check if that's okay for this case
    if (processedVideo?.usedFallback) {
      // If we're in the template grid preview, the fallback is fine
      return processedVideo.path;
    }

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
    const isPremiumTemplate = template && !template.tiers.includes("FREE");

    if (isPremiumTemplate && isFreeTier) {
      setShowPricingModal(true);
    } else if (hasReachedFreeDownloadLimit && isFreeTier) {
      setShowPricingModal(true);
    } else if (onDownload) {
      onDownload(job.id, templateKey);
    }
  };

  // Get the main job that contains all processed videos
  const mainJob = Object.values(latestJobsByTemplate).find(
    (job) =>
      job.metadata?.processedTemplates?.length &&
      job.metadata?.processedTemplates?.length > 0
  );

  const fallbackThumbnail = getRandomPhotoUrl();

  const getThumbnailForTemplate = (
    template: Template,
    videoUrl: string | null | undefined
  ) => {
    // If we have a video URL, check if it's actually an image (fallback case)
    if (
      videoUrl &&
      (videoUrl.endsWith(".webp") ||
        videoUrl.endsWith(".jpg") ||
        videoUrl.endsWith(".png"))
    ) {
      return videoUrl; // Use the fallback image directly as the thumbnail
    }

    // Otherwise use the template's thumbnail or a fallback
    return (
      template.thumbnailUrl ||
      getTemplatePlaceholder(template.key) ||
      fallbackThumbnail ||
      ""
    );
  };

  // Update the onClick handler for the button
  const handleButtonClick = (template: Template, latestJob?: VideoJob) => {
    if (!latestJob) {
      onGenerateVideo(template.key);
      return;
    }

    const isPremiumTemplate = template && !template.tiers.includes("FREE");
    const isDownloadLimited = isFreeTier && downloadCount >= 1;

    // Get video URL for this template
    const videoUrl = getVideoUrlForTemplate(template, latestJob);

    if (
      (isPremiumTemplate && isFreeTier) ||
      (isDownloadLimited && isFreeTier)
    ) {
      // Open pricing modal
      setShowPricingModal(true);
      // Also call the parent's onUpgradeClick if available
      if (onUpgradeClick) {
        onUpgradeClick();
      }
    } else if (videoUrl && latestJob.status === "COMPLETED") {
      handleDownloadClick(template.key, latestJob);
    } else {
      onGenerateVideo(template.key);
    }
  };

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

            // Check if there's an active job that's newer than our latest completed job
            const isProcessing = activeJobs.some(
              (job) =>
                job.template === template.key &&
                (job.status === "PROCESSING" || job.status === "PENDING") &&
                (!latestJob ||
                  new Date(job.createdAt) >= new Date(latestJob.createdAt))
            );

            const videoUrl = latestJob
              ? getVideoUrlForTemplate(template, latestJob)
              : null;
            const isPremiumTemplate = !template.tiers.includes("FREE");
            const isPremium = isPremiumTemplate && isFreeTier;
            const isDownloadDisabled = !!(
              hasReachedFreeDownloadLimit &&
              isFreeTier &&
              videoUrl &&
              latestJob?.status === "COMPLETED"
            );

            return (
              <Card
                key={template.key}
                className={cn("overflow-hidden rounded-lg")}
              >
                <div className='relative bg-gray-100 aspect-[9/16]'>
                  {videoUrl && !isPremium ? (
                    <video
                      id={`video-${template.key}`}
                      src={videoUrl}
                      className='w-full h-full object-cover'
                      controlsList='nodownload'
                      onContextMenu={(e) => e.preventDefault()}
                      controls
                      poster={getThumbnailForTemplate(template, videoUrl)}
                    />
                  ) : (
                    <div className={cn("relative w-full h-full")}>
                      {!videoUrl && (
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <div className='absolute inset-0 bg-black/20 backdrop-blur-[2px]'></div>
                          <div className='z-10 text-white text-center px-4'>
                            <p className='text-sm font-medium mb-2'>
                              {template.name} Preview
                            </p>
                            <p className='text-xs opacity-80'>
                              Generate to create your video
                            </p>
                          </div>
                        </div>
                      )}
                      {isPremium && videoUrl ? (
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <div className='absolute inset-0 bg-black/50 backdrop-blur-[2px]'></div>
                          <div className='z-10 text-white text-center px-4'>
                            <p className='text-sm font-medium mb-2'>
                              Pro Template
                            </p>
                            <p className='text-xs opacity-80'>
                              Upgrade to view and download
                            </p>
                          </div>
                        </div>
                      ) : null}
                      <video
                        id={`video-preview-${template.key}`}
                        src={videoUrl || undefined}
                        className='w-full h-full object-cover'
                        controlsList='nodownload'
                        onContextMenu={(e) => e.preventDefault()}
                        controls={!isPremium}
                        poster={getThumbnailForTemplate(template, videoUrl)}
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
                    onClick={() => handleButtonClick(template, latestJob)}
                    disabled={
                      isProcessing ||
                      !photos.length ||
                      isGenerating ||
                      (isPremium && isFreeTier) ||
                      downloadingTemplate !== null
                    }
                    className={cn(
                      "w-full",
                      isPremium && isFreeTier
                        ? "bg-gray-200 hover:bg-gray-200 text-gray-500 cursor-not-allowed"
                        : isDownloadDisabled && isFreeTier
                        ? "bg-black hover:bg-black/90 text-white"
                        : ""
                    )}
                  >
                    {downloadingTemplate === template.key ? (
                      <div className='flex items-center'>
                        <svg
                          className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          ></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          ></path>
                        </svg>
                        Downloading...
                      </div>
                    ) : isProcessing ? (
                      <div className='flex items-center justify-center space-x-2'>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        <span>Generating...</span>
                      </div>
                    ) : videoUrl ? (
                      latestJob?.status === "COMPLETED" ? (
                        isPremium ? (
                          "Upgrade to Pro"
                        ) : isDownloadDisabled ? (
                          "Upgrade to Download"
                        ) : (
                          "Download HD"
                        )
                      ) : (
                        "Regenerate"
                      )
                    ) : (
                      "Generate"
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
