import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { VideoJob, VideoTemplate, Photo } from "@/types/listing-types";
import ListingSkeleton from "./ListingSkeleton";

const TEMPLATES = [
  {
    id: "crescendo",
    name: "Crescendo",
    description:
      "A dynamic template that builds momentum with progressively longer clips",
    thumbnailUrl: "/images/templates/crescendo.jpg",
  },
  {
    id: "wave",
    name: "Wave",
    description:
      "An engaging rhythm that alternates between quick glimpses and lingering views",
    thumbnailUrl: "/images/templates/wave.jpg",
  },
  {
    id: "storyteller",
    name: "Storyteller",
    description:
      "A narrative-driven template that guides viewers through the property story",
    thumbnailUrl: "/images/templates/storyteller.jpg",
  },
  {
    id: "googlezoomintro",
    name: "Google Zoom Intro",
    description:
      "Start with a dramatic Google Maps zoom into the property location, followed by property highlights",
    thumbnailUrl: "/images/templates/googlezoomintro.jpg",
  },
  {
    id: "wesanderson",
    name: "Wes Anderson",
    description:
      "Symmetrical compositions with nostalgic color grading inspired by Wes Anderson's distinctive style",
    thumbnailUrl: "/images/templates/wesanderson.jpg",
  },
  {
    id: "hyperpop",
    name: "Hyperpop",
    description:
      "Fast-paced, energetic cuts with rapid transitions and dynamic movement",
    thumbnailUrl: "/images/templates/hyperpop.jpg",
  },
];

interface TemplateGridProps {
  videoJobs: VideoJob[];
  photos: Photo[] | undefined;
  isLoading: boolean;
  userTier: string;
  activeJobs: VideoJob[];
  onGenerateVideo: (templateId: string) => void;
  isGenerating?: boolean;
}

export const TemplateGrid: React.FC<TemplateGridProps> = ({
  videoJobs,
  photos,
  isLoading,
  userTier,
  activeJobs,
  onGenerateVideo,
  isGenerating = false,
}) => {
  // Check if any job is currently processing
  const isProcessing = activeJobs.some(
    (job) => job.status === "PROCESSING" || job.status === "PENDING"
  );

  if (isLoading) {
    return (
      <>
        <ListingSkeleton />
        <ListingSkeleton />
        <ListingSkeleton />
      </>
    );
  }

  // Group jobs by template
  const jobsByTemplate = videoJobs.reduce<Record<string, VideoJob[]>>(
    (acc, job) => {
      if (!job.template) return acc;
      if (!acc[job.template]) {
        acc[job.template] = [];
      }
      acc[job.template].push(job);
      return acc;
    },
    {}
  );

  return (
    <>
      {TEMPLATES.map((template) => {
        const templateJobs = jobsByTemplate[template.id] || [];
        const latestJob = templateJobs[0];
        const isTemplateGenerating = activeJobs.some(
          (job) =>
            job.template === template.id &&
            (job.status === "PROCESSING" || job.status === "PENDING")
        );

        return (
          <Card
            key={template.id}
            className='relative overflow-hidden group hover:shadow-lg transition-all duration-200'
          >
            <div className='relative aspect-video bg-gray-100'>
              {latestJob?.thumbnailUrl ? (
                <Image
                  src={latestJob.thumbnailUrl}
                  alt={template.name}
                  fill
                  className='object-cover'
                />
              ) : (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='text-center p-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      {template.name}
                    </h3>
                    <p className='text-sm text-gray-500 mt-1'>
                      {template.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className='p-4'>
              {latestJob?.thumbnailUrl ? (
                <>
                  <h3 className='font-semibold text-gray-900'>
                    {template.name}
                  </h3>
                  <p className='text-sm text-gray-500 mt-1'>
                    {template.description}
                  </p>
                </>
              ) : null}
              <Button
                onClick={() => onGenerateVideo(template.id)}
                disabled={
                  isTemplateGenerating || !photos?.length || isGenerating
                }
                className='w-full mt-4'
                variant={latestJob ? "outline" : "default"}
              >
                {isTemplateGenerating ? (
                  <div className='flex items-center space-x-2'>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    <span>Generating...</span>
                  </div>
                ) : latestJob ? (
                  "Regenerate Video"
                ) : (
                  "Generate Video"
                )}
              </Button>
            </div>
          </Card>
        );
      })}

      {isProcessing && (
        <div className='col-span-full'>
          <Card className='p-6 space-y-4'>
            <div className='flex items-center space-x-4'>
              <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center'>
                <Loader2 className='w-6 h-6 text-blue-600 animate-spin' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>Generating Your Video</h3>
                <p className='text-sm text-gray-500'>
                  {activeJobs[0]?.metadata?.stage === "webp"
                    ? "Optimizing your photos for the best quality..."
                    : activeJobs[0]?.metadata?.stage === "runway"
                    ? "Applying AI enhancements to your photos..."
                    : activeJobs[0]?.metadata?.stage === "template"
                    ? "Creating your video with the selected template..."
                    : activeJobs[0]?.metadata?.stage === "final"
                    ? "Finalizing your video..."
                    : "Processing your video..."}
                </p>
              </div>
            </div>

            <div className='space-y-2'>
              <div className='w-full bg-gray-100 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-500'
                  style={{ width: `${activeJobs[0]?.progress || 0}%` }}
                />
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <span>Progress: {activeJobs[0]?.progress || 0}%</span>
                {activeJobs[0]?.metadata?.currentFile &&
                  activeJobs[0]?.metadata?.totalFiles && (
                    <span>
                      Processing file {activeJobs[0].metadata.currentFile} of{" "}
                      {activeJobs[0].metadata.totalFiles}
                    </span>
                  )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
