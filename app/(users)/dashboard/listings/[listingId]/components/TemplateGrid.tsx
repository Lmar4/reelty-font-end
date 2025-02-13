import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { VideoJob, VideoTemplate } from "@/types/listing-types";
import { TemplateSkeleton } from "./TemplateSkeleton";

interface TemplateGridProps {
  templates?: VideoTemplate[];
  isLoading?: boolean;
  userTier: string;
  isRegenerating?: boolean;
  activeJob?: VideoJob;
  onDownload: (jobId: string, templateId: string, isTemplateAvailable: boolean) => void;
}

export function TemplateGrid({
  templates,
  isLoading,
  userTier,
  isRegenerating,
  activeJob,
  onDownload,
}: TemplateGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <TemplateSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!templates?.length) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No templates available</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => {
        const isTemplateAvailable = template.tiers.includes(userTier.toLowerCase());

        return (
          <Card key={template.id} className="overflow-hidden">
            <div className="relative aspect-video">
              {template.thumbnailUrl ? (
                <Image
                  src={template.thumbnailUrl}
                  alt={template.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-muted" />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold">{template.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {template.description}
              </p>
              <Button
                className="w-full mt-4"
                disabled={!activeJob?.id || isRegenerating || !isTemplateAvailable}
                onClick={() =>
                  onDownload(activeJob?.id || "", template.id, isTemplateAvailable)
                }
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : !isTemplateAvailable ? (
                  "Upgrade Required"
                ) : (
                  "Download"
                )}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
