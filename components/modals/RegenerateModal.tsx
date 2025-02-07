"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRegenerateJob } from "@/hooks/use-jobs";
import { useState } from "react";

interface RegenerateModalProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RegenerateModal = ({
  jobId,
  isOpen,
  onClose,
  onSuccess,
}: RegenerateModalProps) => {
  const [template, setTemplate] = useState("");
  const [files, setFiles] = useState<string[]>([]);

  const regenerateJob = useRegenerateJob(jobId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await regenerateJob.mutateAsync({
        template: template || undefined,
        inputFiles: files.length > 0 ? files : undefined,
      });

      toast.success("Video regeneration started");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("[REGENERATE_ERROR]", error);
      toast.error("Failed to regenerate video");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Regenerate Video</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="template">Template (Optional)</Label>
            <Input
              id="template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Leave empty to use the same template"
            />
          </div>

          <div>
            <Label htmlFor="files">Files (Optional)</Label>
            <Input
              id="files"
              type="file"
              multiple
              onChange={(e) => {
                const fileList = e.target.files;
                if (fileList) {
                  setFiles(Array.from(fileList).map((file) => file.name));
                }
              }}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Leave empty to use the same files
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={regenerateJob.isPending}>
              {regenerateJob.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                "Regenerate"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
