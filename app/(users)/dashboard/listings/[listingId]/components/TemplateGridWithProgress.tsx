"use client";

import { TemplateGrid } from "./TemplateGrid";
import { useJobProgress } from "@/hooks/queries/use-job-progress";
import { VideoJob } from "@/types/listing-types";

interface TemplateGridWithProgressProps {
  videoJobs: VideoJob[];
  photos: any[];
  isLoading: boolean;
  userTier: string;
  activeJobs: VideoJob[];
  onGenerateVideo: (templateId: string) => void;
  onDownload?: (jobId: string, templateKey: string) => void;
  isGenerating?: boolean;
  downloadCount?: number;
  downloadingTemplate?: string | null;
  onUpgradeClick?: () => void;
}

export const TemplateGridWithProgress = (
  props: TemplateGridWithProgressProps
) => {
  const { activeJobs } = props;

  // Use the hook to fetch job progress
  const { progress } = useJobProgress(
    activeJobs && activeJobs.length > 0 ? activeJobs[0]?.id : undefined
  );

  // Pass all props plus the job progress to the TemplateGrid component
  return <TemplateGrid {...props} jobProgress={progress || undefined} />;
};
